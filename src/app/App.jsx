import { RouterProvider, createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true,   Component: Home },
      { path: 'jugar', Component: Game },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
