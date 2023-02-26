
import { LineHandle } from "./lineElement";

declare var acquireVsCodeApi: any;

var vscode: any;

if (typeof acquireVsCodeApi !== 'undefined') {
  vscode = acquireVsCodeApi();
}
else {
  console.log('acquireVsCodeApi not found, creating mock');
  vscode = {
    postMessage: (message: any) => {
      console.log('Mock postMessage', message);
    }
  }
}

// Export class for use in extension
export default class Editor {
  
  // Create callback list (hook layer for vscode incoming data)
  static tokenChangeCB: Function[] = []; 
  static selectedLine: LineHandle | null = null;

  static onUpdate(message: string) {
    const tokens = this.tokenize(message);
    this.redraw(tokens);
  }

  static requestUpdate() {
    vscode.postMessage({
      type: 'requestUpdate'
    });
  }
  
  static tokenize(text: string): string[] {
    const lines = text.split('\r');
  
    return lines;
  }
  
  static redraw(tokens: string[]) {
    Editor.tokenChangeCB.forEach(cb => cb(tokens));
  }
  

  static writeText(text: string) {

    // Send message back to vscode
    vscode.postMessage({
      type: 'update',
      text: text
    });
  }
}