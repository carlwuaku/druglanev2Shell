import { AuthProvider } from 'react-auth-kit';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <AuthProvider
    authType="cookie"
    authName="_auth"
    cookieDomain="druglane.com"
    cookieSecure={false}
  >
    <App />
  </AuthProvider>
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
