import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { useAuthStore } from '@/shared/stores/auth.store'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const AppShell = lazy(() => import('@/pages/AppShell').then((module) => ({ default: module.AppShell })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ServerDetailPage = lazy(() => import('@/pages/ServerDetailPage').then((module) => ({ default: module.ServerDetailPage })))
const NotificationSettingsPage = lazy(() => import('@/pages/NotificationSettingsPage').then((module) => ({ default: module.NotificationSettingsPage })))
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage').then((module) => ({ default: module.IntegrationsPage })))
const LandingPage = lazy(() => import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })))

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-6">
      <div className="w-full max-w-xl rounded-[22px] border border-white/7 bg-surface-panel/90 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="h-2 w-24 rounded-full bg-brand/50" />
        <div className="mt-5 h-7 w-52 rounded-full bg-white/8" />
        <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-white/6" />
        <div className="mt-8 grid gap-3">
          <div className="h-24 rounded-[18px] bg-white/6" />
          <div className="h-24 rounded-[18px] bg-white/5" />
        </div>
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <Navigate to="/app/servers" replace /> : <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
          <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected */}
          <Route
            path="/app"
            element={<RequireAuth><AppShell /></RequireAuth>}
          >
            <Route index element={<Navigate to="servers" replace />} />
            <Route path="servers" element={<DashboardPage />} />
            <Route path="servers/:serverId" element={<ServerDetailPage />} />
            <Route path="settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="settings/integrations" element={<IntegrationsPage />} />
          </Route>

          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
