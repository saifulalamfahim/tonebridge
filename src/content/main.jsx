import { createRoot } from 'react-dom/client';
import { FloatingOverlay } from './FloatingOverlay.jsx';
import styles from './styles.css?inline';

const host = document.createElement('div');
host.id = 'tonebridge-extension-root';
const shadowRoot = host.attachShadow({ mode: 'closed' });
const style = document.createElement('style');
const mountPoint = document.createElement('div');
style.textContent = styles;
shadowRoot.append(style, mountPoint);
document.documentElement.append(host);
createRoot(mountPoint).render(<FloatingOverlay />);
