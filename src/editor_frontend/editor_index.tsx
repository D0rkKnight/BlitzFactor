import * as React from "react";
import { createRoot } from 'react-dom/client';
import App from './App';
import Editor from './editor';

const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);

// Update display on update
window.addEventListener('message', event => {
  const message = event.data; // The JSON data our extension sent

  switch (message.type) {
      case 'update':
          Editor.onUpdate(message.text);
          break;
  }
});

// Load everything now
Editor.requestUpdate();
