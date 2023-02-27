import {TokenHook} from './tokenHook';

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
  static selectedLines: TokenHook[] = [];

  // This is pretty important
  static tokenState = {
    tokens: [] as string[]
  };

  static onUpdate(message: string) {
    this.tokenState.tokens = this.tokenize(message);
    this.redraw(this.tokenState.tokens);
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

  static setSelectedLine(line: TokenHook, multiSelect: boolean = false) {
    if (this.selectedLines.includes(line))
      return;

    if (!multiSelect){
      // Deselect all other lines
      this.selectedLines.forEach(l => {
        l.deselect();
      });

      this.selectedLines = [line];
    }
    else
      this.selectedLines.push(line);
  }

  static moveLine(from: number, to: number) {
    if (from === to)
      return;

    // Move token and shift everything else
    const tokens = Editor.tokenState.tokens;
    const token = tokens[from];
    tokens.splice(from, 1);
    tokens.splice(to, 0, token);

    this.redraw(tokens);
    this.writeText(tokens.join('\r'));
  }

  static addLine() {
    const tokens = Editor.tokenState.tokens;
    tokens.push('New Line, id '+Editor.nextID);
    Editor.redraw(tokens);
    Editor.writeText(tokens.join('\r'));
  }

  static nextID = 0;
  static getTokenID() {
    return this.nextID++;
  }
}