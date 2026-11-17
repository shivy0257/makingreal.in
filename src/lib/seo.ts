import { useEffect } from "react";

const ORIGIN = "https://www.makingreal.in";

type MetaKind = "name" | "property";

const metaTag = (kind: MetaKind, key: string) =>
  document.head.querySelector<HTMLMetaElement>(`meta[${kind}="${key}"]`);

const writeMeta = (kind: MetaKind, key: string, content: string) => {
  let tag = metaTag(kind, key);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(kind, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

type PageMeta = {
  title: string;
  path: string;
  description?: string;
  image?: string;
  noindex?: boolean;
};

export function usePageMeta({ title, path, description, image, noindex }: PageMeta) {
  useEffect(() => {
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const keys: [MetaKind, string][] = [
      ["name", "description"],
      ["property", "og:title"],
      ["property", "og:description"],
      ["property", "og:url"],
      ["property", "og:image"],
      ["name", "twitter:title"],
      ["name", "twitter:description"],
      ["name", "twitter:image"],
      ["name", "robots"],
    ];
    const previous = keys.map(([kind, key]) => ({ kind, key, value: metaTag(kind, key)?.getAttribute("content") ?? null }));
    const previousTitle = document.title;
    const previousCanonical = canonical?.getAttribute("href") ?? null;

    document.title = title;
    if (canonical) canonical.href = `${ORIGIN}${path}`;
    if (description) {
      writeMeta("name", "description", description);
      writeMeta("property", "og:description", description);
      writeMeta("name", "twitter:description", description);
    }
    writeMeta("property", "og:title", title);
    writeMeta("property", "og:url", `${ORIGIN}${path}`);
    writeMeta("name", "twitter:title", title);
    if (image) {
      writeMeta("property", "og:image", image);
      writeMeta("name", "twitter:image", image);
    }
    writeMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");

    return () => {
      document.title = previousTitle;
      if (canonical && previousCanonical !== null) canonical.setAttribute("href", previousCanonical);
      previous.forEach(({ kind, key, value }) => {
        if (value === null) metaTag(kind, key)?.remove();
        else writeMeta(kind, key, value);
      });
    };
  }, [title, path, description, image, noindex]);
}
