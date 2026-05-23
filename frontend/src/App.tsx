import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import ProgramLayout from "@/components/ProgramLayout";

import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import CreateProgramPage from "./pages/CreateProgramPage";
import ProgramDetailsPage from "./pages/ProgramDetailsPage";
import QRManagementEnhanced from "./pages/QRManagementEnhanced";
import GenerateQRPage from "./pages/GenerateQRPage";
import ViewQRDetailsPage from "./pages/ViewQRDetailsPage";
import QRRegistrationPage from "./pages/QRRegistrationPage";
import ResponseViewPage from "./pages/ResponseViewPage";
import ApprovalPanel from "./pages/ApprovalPanel";
import FormBuilderPage from "./pages/FormBuilderPage";
import FormPage from "./pages/FormPage";
import FormResponsesPage from "./pages/FormResponsesPage";
import FormsListPage from "./pages/FormsListPage";
import Certificates from "./pages/Certificates";
import Poster from "./pages/Poster";
import Proposals from "./pages/Proposals";
import Files from "./pages/Files";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CoordinatorLogin from "./pages/CoordinatorLogin";
import RegisterPage from "./pages/RegisterPage";
import AttendancePage from "./pages/AttendancePage";
import PublicFormPage from "./pages/PublicFormPage";
import QRView from "./pages/QRView";
import AdminDashboard from "./pages/AdminDashboard";
import { ProgramProvider } from "@/contexts/ProgramContext";
import { RegistrationProvider } from "@/contexts/RegistrationContext";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "coordinator" | "any";
}

const ProtectedRoute = ({ children, requiredRole = "any" }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for admin token or coordinator token
    const adminAuth = localStorage.getItem("authToken");
    const coordinatorAuth = localStorage.getItem("coordinatorToken");
    const isAuth = adminAuth || coordinatorAuth;
    
    setIsAuthenticated(!!isAuth);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Check which login page to redirect to
    const userRole = localStorage.getItem("userRole");
    if (userRole === "coordinator") {
      return <Navigate to="/coordinator-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole !== "any") {
    const userRole = localStorage.getItem("userRole") || "admin";
    if (requiredRole === "admin" && userRole !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === "coordinator" && userRole !== "coordinator") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{ children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex w-full bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  </div>
);

/**
 * AppContent Component
 * Contains all routes and must be rendered INSIDE BrowserRouter
 * All components inside this component have access to useLocation() and context hooks
 */
const AppContent = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for admin token or coordinator token
    const adminAuth = localStorage.getItem("authToken");
    const coordinatorAuth = localStorage.getItem("coordinatorToken");
    setIsAuthenticated(!!(adminAuth || coordinatorAuth));
  }, []);



  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/coordinator-login" element={<CoordinatorLogin />} />

        {/* Public Form - Canonical route for QR-scanned forms */}
        <Route path="/form/:programId" element={<PublicFormPage />} />

        {/* QR Registration & Attendance Routes (Public - for QR scans) */}
        <Route path="/register/:programId" element={<RegisterPage />} />
        <Route path="/attendance/:programId" element={<AttendancePage />} />
        <Route path="/qr-register/:programId" element={<QRRegistrationPage />} />
        <Route
          path="/create-program"
          element={
            <ProgramLayout>
              <CreateProgramPage />
            </ProgramLayout>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Programs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/program-details"
          element={
            <ProtectedRoute>
              <ProgramLayout>
                <ProgramDetailsPage />
              </ProgramLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-management"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QRManagementEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-management/:programId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QRManagementEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-codes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QRManagementEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-management"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QRManagementEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-management/:programId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QRManagementEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs/:programId/qr"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QRManagementEnhanced />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate-qr/:programId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GenerateQRPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-details/:programId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ViewQRDetailsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/responses/:programId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResponseViewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/approval-requests/:programId"
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <ApprovalPanel />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Certificates />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/poster"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Poster />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Proposals />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Files />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Custom Forms Routes */}
        <Route
          path="/forms"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FormsListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/form-builder"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FormBuilderPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/form-builder/:formId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FormBuilderPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/custom-form/:formId" element={<FormPage />} />
        <Route
          path="/form-responses/:formId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FormResponsesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard for Registration Management */}
        <Route
          path="/admin/registrations"
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* QR View - Public route for displaying scanned QR data */}
        <Route path="/qr-view" element={<QRView />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

/**
 * Root App Component
 * 
 * Provider Hierarchy (order matters!):
 * 1. ProgramProvider - MUST be at the top level
 * 2. RegistrationProvider - For registration management
 * 3. QueryClientProvider - React Query
 * 4. TooltipProvider - UI tooltips
 * 5. BrowserRouter - React Router (contains route definitions)
 * 6. AppContent - Components that use useLocation() and usePrograms()
 * 
 * This ensures:
 * - ProgramContext is available to all components
 * - RegistrationContext is available to all components
 * - React Router is initialized before routes render
 * - All context hooks work properly
 */
const App = () => (
  <ProgramProvider>
    <RegistrationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </RegistrationProvider>
  </ProgramProvider>
);

export default App;
