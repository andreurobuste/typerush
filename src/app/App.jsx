import { RouterProvider, createBrowserRouter, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true,             Component: Home },
      { path: 'jugar',           Component: Game },
      { path: 'login',           Component: Login },
      { path: 'signup',          Component: SignUp },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'reset-password',  Component: ResetPassword },
      { path: 'profile',         element: <ProtectedRoute><Profile /></ProtectedRoute> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
