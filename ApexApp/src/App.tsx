import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import LoginPage from '@/pages/Login';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import DashboardPage from '@/pages/Dashboard';
import ProjectRequestsPage from '@/pages/ProjectRequests';
import ProjectRequestDetailPage from '@/pages/ProjectRequestDetail';
import ProjectsPage from '@/pages/Projects';
import ProjectDetailPage from '@/pages/ProjectDetail';
import TasksPage from '@/pages/Tasks';
import TaskDetailPage from '@/pages/TaskDetail';
import ChangeRequestsPage from '@/pages/ChangeRequests';
import ChangeRequestDetailPage from '@/pages/ChangeRequestDetail';
import CreateChangeRequestPage from '@/pages/CreateChangeRequest';
import ChangeRequestEditPage from '@/pages/EditChangeRequest';
import ChangeAnalyticsPage from '@/pages/ChangeAnalytics';

import NotFoundPage from '@/pages/NotFound';
import EditProjectRequestPage from './pages/EditProjectRequest';
import UserManagement from './pages/admin/UserManagement';
import UserProfile from './pages/UserProfile';
import TaskDetail from '@/pages/TaskDetail';
import { Departments } from '@/pages/admin/Departments';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path='/login' element={<LoginPage />} />
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
            <Route path='/reset-password' element={<ResetPasswordPage />} />
            {/* Protected Routes */}
            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <Navigate to='/dashboard' replace />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Project Requests */}
            <Route
              path='/project-requests'
              element={
                <ProtectedRoute>
                  <ProjectRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/project-requests/:id'
              element={
                <ProtectedRoute>
                  <ProjectRequestDetailPage />
                </ProtectedRoute>
              }
            />
            {/* Projects */}
            <Route
              path='/projects'
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/projects/:id'
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/project-requests/:id/edit'
              element={
                <ProtectedRoute>
                  <EditProjectRequestPage />
                </ProtectedRoute>
              }
            />
            {/* Tasks */}
            <Route
              path='/projects/:id/tasks'
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/projects/:id/tasks/:taskId'
              element={
                <ProtectedRoute>
                  <TaskDetailPage />
                </ProtectedRoute>
              }
            />
            {/* Change Requests */}
            <Route
              path='/change-requests'
              element={
                <ProtectedRoute>
                  <ChangeRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/change-requests/:id'
              element={
                <ProtectedRoute>
                  <ChangeRequestDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/change-requests/create'
              element={
                <ProtectedRoute>
                  <CreateChangeRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/change-analytics'
              element={
                <ProtectedRoute>
                  <ChangeAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/change-requests/:id/edit'
              element={
                <ProtectedRoute>
                  <ChangeRequestEditPage />
                </ProtectedRoute>
              }
            />
            // User Profile (all users)
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            // Admin User Management (TenantAdmin only)
            <Route
              path='/admin/users'
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path='/admin/departments' element={<Departments />} />
            {/* 404 */}
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
