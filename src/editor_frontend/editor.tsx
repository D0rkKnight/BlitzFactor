import { TokenType } from "../tokenTypes";

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
  static lineSelectChangeCB: Function[] = [];
  static selectedLines: number[] = [];

  // This is pretty important
  static tokenState = {
    tokens: [] as string[]
  };

  // static onUpdate(message: string) {
  //   this.tokenState.tokens = this.tokenize(message);
  //   this.redraw(this.tokenState.tokens);
  // }

  static onUpdate(message: any) {
    let filtered = this.filterTree(message);

    console.log(filtered);

    this.redraw(filtered);
  }

  static filterTree(json: any) {
    let newJson = {... json};
    newJson['children'] = [];

    // Delete all punctuation (punctuation are leaf nodes so we can just cull them)
    // TODO: perform the culling on the frontend
    if (json['type'] == TokenType.punctuation)
        return null;

    for (let i = 0; i < json['children'].length; i++) {
        let child = json['children'][i];

        let newChild = this.filterTree(child);

        if (newChild != null)
            newJson['children'].push(newChild);
    }

    // Redefine bounds, should be safe since we're in our own model by now
    if (newJson['children'].length > 0) {
      newJson['start'] = newJson['children'][0]['start'];
      newJson['end'] = newJson['children'][newJson['children'].length - 1]['end'];
    }

    return newJson;
  }

  static requestUpdate() {
    vscode.postMessage({
      type: 'requestUpdate'
    });
  }
  
  static redraw(tokens: any) {
    Editor.tokenChangeCB.forEach(cb => cb(tokens));
  }

  static writeText(text: string) {

    // Send message back to vscode
    vscode.postMessage({
      type: 'update',
      text: text
    });
  }

  static selectLine(line: number) {
    if (this.selectedLines.includes(line))
      return;

    if (!this.multiSelect){
      this.deselectAll();

      this.selectedLines = [line];
      Editor.lineSelectChangeCB.forEach(cb => cb(this.selectedLines));
    }
    else
    {
      this.selectedLines.push(line);
      Editor.lineSelectChangeCB.forEach(cb => cb(this.selectedLines));
    }
  }

  static moveLine(from: number, to: number) {
    if (from === to)
      return;

    // Take every selected line and group together, then place them in the new location
    var tokens = Editor.tokenState.tokens;
    var selectedLines = Editor.selectedLines;
    var group = [] as string[];
    var orderedSelectedLines = selectedLines.sort((a, b) => a - b);

    for (var i = 0; i < orderedSelectedLines.length; i++) {
      group.push(tokens[orderedSelectedLines[i]]);
    }

    // Remove the group from the old location
    
    // Iterate in reversed order
    for (var i = orderedSelectedLines.length - 1; i >= 0; i--) {
      tokens.splice(orderedSelectedLines[i], 1);
    }

    // Insert the group into the new location
    for (var i = group.length - 1; i >= 0; i--) {
      tokens.splice(to, 0, group[i]);
    }

    // Move the selected lines to the new location
    var newSelected = [] as number[];
    for (var i = 0; i < orderedSelectedLines.length; i++) {
      newSelected.push(to + i);
    }

    Editor.setSelection(newSelected);


    this.redraw(tokens);
    this.writeText(tokens.join('\r'));
  }

  static addLine() {
    const tokens = Editor.tokenState.tokens;
    tokens.push('New Line, id '+Editor.nextID);

    Editor.deselectAll();
    Editor.redraw(tokens);
    Editor.writeText(tokens.join('\r'));
  }

  static nextID = 0;
  static getTokenID() {
    return this.nextID++;
  }

  static onKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      console.log("Working")
      Editor.addLine();
    }

    if (e.key === 'Delete') {
      Editor.selectedLines.forEach(l => {
        this.deleteSelection()
      });
    }

    if (e.key === 'ArrowUp') {
      var target = this.getCursor() - 1;
      if (target < 0 || target >= this.tokenState.tokens.length)
        return;

      this.moveLine(this.getCursor(), target);
    }

    if (e.key === 'ArrowDown') {
      var target = this.getCursor() + 1;
      if (target < 0 || target >= this.tokenState.tokens.length - this.selectedLines.length + 1)
        return;

      this.moveLine(this.getCursor(), target);
    }

    if (e.key === 'Ctrl') {
      Editor.multiSelect = true;
    }
  }

  static onKeyUp(e: KeyboardEvent) {
    if (e.key === 'Ctrl') {
      Editor.multiSelect = false;
    }
  }

  static deleteSelection() {
    const tokens = Editor.tokenState.tokens;
    
    // Order the selected lines and delete from the backside
    var orderedSelectedLines = Editor.selectedLines.sort((a, b) => b - a);
    for (var i = 0; i < orderedSelectedLines.length; i++) {
      tokens.splice(orderedSelectedLines[i], 1);
    }

    Editor.deselectAll();
    Editor.redraw(tokens);
    Editor.writeText(tokens.join('\r'));
  }

  static deselectAll() {
    Editor.setSelection([]);
  }

  static multiSelect: boolean = false;

  static setSelection(lines: number[]) {
    Editor.selectedLines = lines;
    Editor.lineSelectChangeCB.forEach(cb => cb(lines));
  }

  static getCursor() {
    // Get min selected line
    var min = -1;
    for (var i = 0; i < Editor.selectedLines.length; i++) {
      if (Editor.selectedLines[i] < min || min === -1)
        min = Editor.selectedLines[i];
    }

    return min;
  }
}