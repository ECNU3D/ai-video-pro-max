import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Note: StrictMode intentionally omitted — its double-mounting churns the
// WebGL context under react-three-fiber.
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
