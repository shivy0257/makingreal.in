import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ApertureMarkNext } from "@/components/ApertureMarkNext";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";

export function PageHeader({ children, back = false }: { children?: ReactNode; back?: boolean }) {
  return <header className="legal-header studio-topbar">
    <Link to="/" className="wordmark" aria-label="MAKINGREAL home"><ApertureMarkNext />MAKINGREAL</Link>
    <div className="studio-topbar-actions">
      {children}
      {isSupabaseConfigured && <nav className="studio-topnav" aria-label="Creator pages">
        <Link to="/creators">Creators</Link>
        <Link to="/admin">Creator studio</Link>
      </nav>}
      <Link to={back ? "/creators" : "/"} className="legal-back">
        <ArrowLeft aria-hidden="true" />{back ? "All creators" : "Back to site"}
      </Link>
    </div>
  </header>;
}
