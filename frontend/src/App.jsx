import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import ReadersPage from './pages/ReadersPage';
import LoansPage from './pages/LoansPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['administrador', 'bibliotecario']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/books" element={<BooksPage />} />
            <Route
              path="/readers"
              element={
                <ProtectedRoute roles={['administrador', 'bibliotecario']}>
                  <ReadersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/loans" element={<LoansPage />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['administrador']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
