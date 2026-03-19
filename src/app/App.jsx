import { RouterProvider } from 'react-router';
import { AuthProvider } from './lib/AuthContext';
import { router } from './routes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
