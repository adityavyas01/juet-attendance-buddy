import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('=== JUET APP DEBUG: Starting app initialization ===');
console.log('Environment:', import.meta.env);
console.log('API URL:', import.meta.env.VITE_API_URL);

const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('=== JUET APP DEBUG: Creating React root ===');
  const root = createRoot(rootElement);
  console.log('=== JUET APP DEBUG: Rendering App component ===');
  root.render(<App />);
  console.log('=== JUET APP DEBUG: App component rendered ===');
} else {
  console.error('=== JUET APP DEBUG: Root element not found! ===');
}
