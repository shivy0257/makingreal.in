import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@/components/Analytics";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";

const Creators = lazy(() => import("./pages/Creators"));
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const Studio = lazy(() => import("./pages/Studio"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light", "midnight", "noir"]} enableSystem={false}>
    <BrowserRouter>
      <ScrollToTop />
      <Analytics />
      <Suspense fallback={<div className="route-loading" role="status"><span className="studio-spinner" aria-hidden="true" />Loading…</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/work" element={<Navigate to="/#services" replace />} />
          <Route path="/work/:id" element={<Navigate to="/#services" replace />} />
          <Route path="/about" element={<Navigate to="/#why" replace />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/creators/:slug" element={<CreatorProfile />} />
          <Route path="/admin" element={<Studio />} />
          <Route path="/studio" element={<Navigate to="/admin" replace />} />
          <Route path="/contact" element={<Navigate to="/#contact" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
