import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Usage from "./pages/Usage";
import BabySettings from "./pages/BabySettings";
import PageSettings from "./pages/PageSettings";
import RegisterDonation from "./pages/RegisterDonation";
import RegisterPurchase from "./pages/RegisterPurchase";
import PublicBabyProfile from "./pages/PublicBabyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/usage" element={<ProtectedRoute><Usage /></ProtectedRoute>} />
                <Route path="/baby-settings" element={<ProtectedRoute><BabySettings /></ProtectedRoute>} />
                <Route path="/page-settings" element={<ProtectedRoute><PageSettings /></ProtectedRoute>} />
                <Route path="/register-donation" element={<ProtectedRoute><RegisterDonation /></ProtectedRoute>} />
                <Route path="/register-purchase" element={<ProtectedRoute><RegisterPurchase /></ProtectedRoute>} />
                {/* Public baby profile route */}
                <Route path="/:slug" element={<PublicBabyProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
