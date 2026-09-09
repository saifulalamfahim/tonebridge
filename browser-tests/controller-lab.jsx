import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingOverlay } from '../src/content/FloatingOverlay.jsx';
import '../src/content/styles.css';

createRoot(document.getElementById('root')).render(createElement(FloatingOverlay));
