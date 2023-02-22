import * as React from "react";
import { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

// Export class for use in extension
export default class Editor {
  
  // Create callback list (hook layer for vscode incoming data)
  static tokenChangeCB: Function[] = []; 


  static onUpdate(message: string) {
    const tokens = this.tokenize(message);
    this.redraw(tokens);
  }
  
  static tokenize(text: string): string[] {
    const lines = text.split('\r');
  
    return lines;
  }
  
  static redraw(tokens: string[]) {
    Editor.tokenChangeCB.forEach(cb => cb(tokens));
  }
  

  static writeText(text: string) {

    console.log('Writing text to vscode: ' + text);

    // Send message back to vscode
    vscode.postMessage({
      type: 'update',
      text: text
    });
  }
}

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

