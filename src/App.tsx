
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Programs from "./pages/Programs";
import AddProgram from "./pages/AddProgram";
import EditProgram from "./pages/EditProgram";
import Animateurs from "./pages/Animateurs";
import Conducteurs from "./pages/Conducteurs";
import ConducteurForm from "./pages/ConducteurForm";
import ConducteurView from "./pages/ConducteurView";
import AnimateurInvitation from "./pages/AnimateurInvitation";
import AnimateurLogin from "./pages/AnimateurLogin";
import AnimateurDashboard from "./pages/AnimateurDashboard";
import FullProgram from "./pages/FullProgram";
import FullProgramView from "./pages/FullProgramView";
import StudioDisplay from "./pages/StudioDisplay";
import Marketing from "./pages/Marketing";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Marketing />} />
            <Route path="/login" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/add" element={<AddProgram />} />
            <Route path="/programs/edit/:id" element={<EditProgram />} />
            <Route path="/animateurs" element={<Animateurs />} />
            <Route path="/conducteurs" element={<Conducteurs />} />
            <Route path="/conducteurs/nouveau" element={<ConducteurForm />} />
            <Route path="/conducteurs/:id" element={<ConducteurView />} />
            <Route path="/conducteurs/:id/edit" element={<ConducteurForm />} />
            <Route path="/full-program" element={<FullProgram />} />
            <Route path="/:radioSlug/programme" element={<FullProgram />} />
            <Route path="/:radioSlug/full-programme" element={<FullProgramView />} />
            <Route path="/:radioSlug/studio-display" element={<StudioDisplay />} />
            <Route path="/invitation/:token" element={<AnimateurInvitation />} />
            <Route path="/:radioSlug/animateur/login" element={<AnimateurLogin />} />
            <Route path="/:radioSlug/animateur" element={<AnimateurDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
