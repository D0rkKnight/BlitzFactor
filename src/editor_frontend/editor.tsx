
import { TokenHandle } from "./token";

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
  static selectedLine: TokenHandle | null = null;

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

  static setSelectedLine(line: TokenHandle | null) {
    if (this.selectedLine != null && line != null && this.selectedLine.id === line.id)
      return;

    if (Editor.selectedLine)
      Editor.selectedLine.deselect();
      
    this.selectedLine = line;
  }

  static swapLines(line1: number, line2: number) {
    if (line1 === line2)
      return;

    const tokens = this.tokenState.tokens;
    const temp = tokens[line1];
    tokens[line1] = tokens[line2];
    tokens[line2] = temp;

    this.redraw(tokens);
    this.writeText(tokens.join('\r'));
  }

  static addLine() {
    const tokens = Editor.tokenState.tokens;
    tokens.push('New Line');
    Editor.redraw(tokens);
    Editor.writeText(tokens.join('\r'));
  }

  static nextID = 0;
  static getTokenID() {
    return this.nextID++;
  }
}