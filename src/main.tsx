import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import { registerOffline } from './lib/offline';

createRoot(document.getElementById('root')!).render(<App />);
void registerOffline();
