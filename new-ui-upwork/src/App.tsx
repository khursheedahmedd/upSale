import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import JobsPage from "./pages/admin/JobsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Landing page component - redirects to jobs page for admin users
const LandingPage = () => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (isSignedIn) {
    return <Navigate to="/jobs" replace />;
  }
  
  return <Navigate to="/sign-in" replace />;
};

// Custom styled Clerk components
const CenteredSignIn = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md">
      <SignIn routing="path" path="/sign-in" />
    </div>
  </div>
);

const CenteredSignUp = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md">
      <SignUp routing="path" path="/sign-up" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<CenteredSignIn />} />
          <Route path="/sign-up/*" element={<CenteredSignUp />} />
          
          {/* Admin Routes Only */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          } />
          <Route path="/jobs" element={
            <DashboardLayout>
              <JobsPage />
            </DashboardLayout>
          } />
          <Route path="/users" element={
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          } />
          <Route path="/reports" element={
            <DashboardLayout>
              <ReportsPage />
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
