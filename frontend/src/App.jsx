import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { EventsCatalog } from './pages/EventsCatalog';
import { EventDetails } from './pages/EventDetails';
import { ClubsDirectory } from './pages/ClubsDirectory';
import { ClubDetails } from './pages/ClubDetails';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<EventsCatalog />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/clubs" element={<ClubsDirectory />} />
                  <Route path="/clubs/:id" element={<ClubDetails />} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Role-Protected Portals */}
                  <Route
                    path="/dashboard/student"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'coordinator', 'admin']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/coordinator"
                    element={
                      <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
                        <CoordinatorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Authenticated Profile */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
