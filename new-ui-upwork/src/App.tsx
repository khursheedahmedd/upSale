import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Mail, Lock } from "lucide-react";
import JobsPage from "./pages/admin/JobsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

// Custom styled Clerk components
const CenteredSignIn = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 p-4">
    <div className="w-full max-w-md space-y-4">
      {/* Demo Credentials Card */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-5 w-5 text-teal-600" />
            Demo Credentials
            <Badge className="ml-auto bg-teal-600 hover:bg-teal-700">For Testing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-teal-100">
            <Mail className="h-4 w-4 text-teal-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-mono text-sm font-medium text-foreground">khursheed6577@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-teal-100">
            <Lock className="h-4 w-4 text-teal-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Password</p>
              <p className="font-mono text-sm font-medium text-foreground">&lt;UWA123&gt;</p>
            </div>
          </div>
          <div className="text-xs text-center text-muted-foreground pt-2 border-t border-teal-100">
            Use these credentials to explore the demo
          </div>
        </CardContent>
      </Card>
      
      {/* Clerk Sign In Component */}
      <div className="bg-white rounded-lg shadow-sm">
        <SignIn routing="path" path="/sign-in" />
      </div>
    </div>
  </div>
);

const CenteredSignUp = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 p-4">
    <div className="w-full max-w-md space-y-4">
      {/* Demo Credentials Card */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-5 w-5 text-teal-600" />
            Demo Credentials
            <Badge className="ml-auto bg-teal-600 hover:bg-teal-700">For Testing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-teal-100">
            <Mail className="h-4 w-4 text-teal-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-mono text-sm font-medium text-foreground">khursheed6577@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-teal-100">
            <Lock className="h-4 w-4 text-teal-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Password</p>
              <p className="font-mono text-sm font-medium text-foreground">&lt;UWA123&gt;</p>
            </div>
          </div>
          <div className="text-xs text-center text-muted-foreground pt-2 border-t border-teal-100">
            Use these credentials to explore the demo
          </div>
        </CardContent>
      </Card>
      
      {/* Clerk Sign Up Component */}
      <div className="bg-white rounded-lg shadow-sm">
        <SignUp routing="path" path="/sign-up" />
      </div>
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
