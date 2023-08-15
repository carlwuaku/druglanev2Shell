/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useEffect } from 'react';
import { RequireAuth, useIsAuthenticated } from 'react-auth-kit';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  HashRouter,
  Navigate,
  useLocation,
} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import icon from '../../assets/icon.svg';
import 'primereact/resources/themes/md-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@fontsource/lato';
import '@fontsource/ubuntu';
import './App.css';
import Index from './pages';
import Activate from './pages/activate';
import AddRole from './pages/addRole';
import AddUser from './pages/addUser';
import Login from './pages/login';
import NotFound from './pages/notFound';
import ResetPassword from './pages/resetPassword';
import Roles from './pages/roles';
import SetAdminPasswordPage from './pages/setAdminPasswordPage';
import SettingsPage from './pages/settings';
import Users from './pages/users';

function Hello() {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
}

function Private({ Component }: { Component: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const auth = isAuthenticated();
  return auth ? <>{Component}</> : <Navigate to="/login" />;
}

function RouteChangeLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);

  return null; // This component doesn't render anything
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/activate" element={<Activate />} />
        <Route path="/help" element={<Index />} />
        <Route
          path="/settings"
          element={<Private Component={<SettingsPage />} />}
        />
        <Route path="/adminPassword" element={<SetAdminPasswordPage />} />
        <Route path="/roles" element={<Private Component={<Roles />} />} />
        <Route path="/addRole" element={<AddRole />} />
        <Route
          path="/addRole/:id"
          element={<Private Component={<AddRole />} />}
        />
        <Route path="/users" element={<Private Component={<Users />} />} />
        <Route path="/addUser" element={<Private Component={<AddUser />} />} />
        <Route
          path="/addUser/:id"
          element={<Private Component={<AddUser />} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <RouteChangeLogger />
    </HashRouter>
  );
}
