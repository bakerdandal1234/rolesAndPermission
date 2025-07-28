import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "./components/auth/Protectedoute"
import { ThemeProvider } from "./components/theme/theme-provider"
// Auth Pages
import LoginPage from "./pages/auth/Login"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import HomePage from "./pages/HomePage"
import ResetPasswordPage from "./pages/auth/reset-password"
import VerifyEmailPage from "./pages/auth/verify-email"
import AdminPage from "./pages/AdminPage"
// Dashboard Pages
import Navbar from "./components/Navbar"
import AdminRoute from "./components/auth/AdminRoute"
import { ForgotPasswordForm } from "./pages/auth/forgot-password"
import AuthSuccess from "./pages/auth/AuthSuccess"
import Welcome from "./pages/Welcome"
import ProductDetailsPage from "./pages/ProductDetailsPage"
import CartPage from "./pages/CartPage"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
              <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm onSuccess={() => { /* handle success, e.g., navigate or show a message */ }} />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/" element={<Welcome />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path='/product/:id' element={<ProductDetailsPage />} />
            <Route path='/cart' element={<CartPage />} />
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            

            {/* Default Redirect */}
            {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
    </ThemeProvider>
  )
}

export default App