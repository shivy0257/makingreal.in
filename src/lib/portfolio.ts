import { supabase, portfolioPathFromUrl } from "@/lib/supabase";

export type Role = "creator" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected";
export type ItemStatus = "pending" | "published" | "rejected";

export type Profile = {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  specialties: string[];
  website: string | null;
  instagram: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  availability: string | null;
  role: Role;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
};

export type PortfolioItem = {
  id: string;
  owner_id: string;
  title: string;
  caption: string | null;
  category: string | null;
  year: number | null;
  image_url: string;
  width: number | null;
  height: number | null;
  status: ItemStatus;
  created_at: string;
  profiles?: { display_name: string; slug: string } | null;
};

export type ProfileInput = Pick<Profile, "display_name" | "slug" | "headline" | "bio" | "location" | "specialties" | "website" | "instagram" | "availability" | "avatar_url" | "cover_url">;
export type ItemInput = Pick<PortfolioItem, "title" | "caption" | "category" | "year" | "image_url" | "width" | "height">;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const PROFILE_COLUMNS = "id,slug,display_name,headline,bio,location,specialties,website,instagram,avatar_url,cover_url,availability,role,status,created_at,updated_at";
const ITEM_COLUMNS = "id,owner_id,title,caption,category,year,image_url,width,height,status,created_at";

function db() {
  if (!supabase) throw new Error("Creator studio is not connected yet.");
  return supabase;
}

function normalizeProfile(row: Profile): Profile {
  return { ...row, specialties: row.specialties ?? [] };
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 3 && value.length <= 40;
}

export function safeWebsite(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function instagramLink(value: string | null | undefined): string | null {
  const handle = value?.trim().replace(/^@/, "");
  return handle && /^[a-z0-9._]{1,30}$/i.test(handle) ? `https://instagram.com/${handle}` : null;
}

export function friendlyError(error: unknown): string {
  const raw = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: unknown }).message
      : error;
  const message = typeof raw === "string" ? raw : String(raw ?? "");
  if (/duplicate key|profiles_slug_key/i.test(message)) return "That profile URL is already taken. Try another slug.";
  if (/bucket|size|mime|payload/i.test(message)) return "That image could not be uploaded. Use a JPG, PNG or WebP under 8 MB.";
  if (/row-level security|permission denied/i.test(message)) return "You do not have permission to do that.";
  if (/session|jwt|token/i.test(message)) return "Your session expired. Sign in again and retry.";
  if (/fetch|network/i.test(message)) return "Could not reach the server. Check your connection and retry.";
  return message || "Something went wrong. Try again.";
}

export function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("The server took too long to respond. Check your connection and retry.")), ms);
    promise.then(
      value => { clearTimeout(timer); resolve(value); },
      error => { clearTimeout(timer); reject(error); },
    );
  });
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await db().from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeProfile(data as Profile) : null;
}

export async function fetchPublicCreators(): Promise<Profile[]> {
  const { data, error } = await db()
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("status", "approved")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Profile[]).map(normalizeProfile);
}

export async function fetchCreatorBySlug(slug: string): Promise<{ profile: Profile; items: PortfolioItem[] } | null> {
  const client = db();
  const { data, error } = await client.from("profiles").select(PROFILE_COLUMNS).eq("slug", slug).eq("status", "approved").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const profile = normalizeProfile(data as Profile);
  const { data: items, error: itemsError } = await client
    .from("portfolio_items")
    .select(ITEM_COLUMNS)
    .eq("owner_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (itemsError) throw itemsError;
  return { profile, items: (items ?? []) as PortfolioItem[] };
}

export async function fetchMyItems(ownerId: string): Promise<PortfolioItem[]> {
  const { data, error } = await db()
    .from("portfolio_items")
    .select(ITEM_COLUMNS)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PortfolioItem[];
}

export async function saveProfile(id: string, input: ProfileInput): Promise<Profile> {
  const { data, error } = await db()
    .from("profiles")
    .update({
      display_name: input.display_name.trim(),
      slug: input.slug,
      headline: input.headline.trim() || null,
      bio: input.bio.trim() || null,
      location: input.location.trim() || null,
      specialties: input.specialties,
      website: input.website.trim() || null,
      instagram: input.instagram.trim().replace(/^@/, "") || null,
      availability: input.availability.trim() || null,
      avatar_url: input.avatar_url,
      cover_url: input.cover_url,
    })
    .eq("id", id)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return normalizeProfile(data as Profile);
}

async function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap !== "function") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export async function uploadPortfolioImage(file: File, folder: "avatar" | "cover" | "work") {
  const client = db();
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error("Use a JPG, PNG or WebP image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be under 8 MB.");
  const { data: sessionData } = await client.auth.getUser();
  const user = sessionData.user;
  if (!user) throw new Error("Sign in again to upload.");
  const extension = EXTENSIONS[file.type] ?? "jpg";
  const path = `${user.id}/${folder}-${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("portfolio").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = client.storage.from("portfolio").getPublicUrl(path);
  const size = await imageSize(file);
  return { url: data.publicUrl, width: size?.width ?? null, height: size?.height ?? null };
}

export async function removePortfolioImage(url: string | null | undefined): Promise<void> {
  if (!supabase) return;
  const path = portfolioPathFromUrl(url);
  if (!path) return;
  await supabase.storage.from("portfolio").remove([path]);
}

export async function createPortfolioItem(input: ItemInput): Promise<PortfolioItem> {
  const { data, error } = await db()
    .from("portfolio_items")
    .insert({
      title: input.title.trim(),
      caption: input.caption?.trim() || null,
      category: input.category?.trim() || null,
      year: input.year,
      image_url: input.image_url,
      width: input.width,
      height: input.height,
    })
    .select(ITEM_COLUMNS)
    .single();
  if (error) throw error;
  return data as PortfolioItem;
}

export async function deletePortfolioItem(item: PortfolioItem): Promise<void> {
  const { error } = await db().from("portfolio_items").delete().eq("id", item.id);
  if (error) throw error;
  await removePortfolioImage(item.image_url);
}

export async function fetchPendingProfiles(): Promise<Profile[]> {
  const { data, error } = await db()
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Profile[]).map(normalizeProfile);
}

export async function fetchPendingItems(): Promise<PortfolioItem[]> {
  const { data, error } = await db()
    .from("portfolio_items")
    .select(`${ITEM_COLUMNS},profiles:owner_id(display_name,slug)`)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PortfolioItem[];
}

export async function fetchApprovedCreators(): Promise<Profile[]> {
  return fetchPublicCreators();
}

export async function setProfileStatus(id: string, status: ProfileStatus): Promise<void> {
  const client = db();
  const { error } = await client.from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
  if (status === "approved") {
    const { error: itemsError } = await client.from("portfolio_items").update({ status: "published" }).eq("owner_id", id).eq("status", "pending");
    if (itemsError) throw itemsError;
  }
}

export async function setItemStatus(id: string, status: ItemStatus): Promise<void> {
  const { error } = await db().from("portfolio_items").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await db().auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await db().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/admin` },
  });
  if (error) throw error;
}
