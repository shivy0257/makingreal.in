import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@/components/Analytics";
import { ReticleCursor } from "@/components/ReticleCursor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light", "midnight", "noir"]} enableSystem={false}>
    <BrowserRouter>
      <Analytics />
      <ReticleCursor />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/work" element={<Navigate to="/#services" replace />} />
        <Route path="/work/:id" element={<Navigate to="/#services" replace />} />
        <Route path="/about" element={<Navigate to="/#why" replace />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Navigate to="/#contact" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
