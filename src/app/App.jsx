import { RouterProvider, createBrowserRouter } from 'react-router';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true,    Component: Home },
      { path: 'jugar',  Component: Game },
      { path: 'perfil', Component: Profile },
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
