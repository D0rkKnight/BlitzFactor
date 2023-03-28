import Tokenizer from "../tokenizer";
import SyntaxTree from "./SyntaxTree";
import Token from "../token";

declare var acquireVsCodeApi: any;

var vscode: any;

if (typeof acquireVsCodeApi !== "undefined") {
  vscode = acquireVsCodeApi();
} else {
  console.log("acquireVsCodeApi not found, creating mock");
  vscode = {
    postMessage: (message: any) => {
      console.log("Mock postMessage", message);
    },
  };
}

// Export class for use in extension
export default class Editor {
  // Create callback list (hook layer for vscode incoming data)
  static tokenChangeCB: Function[] = [];
  // static lineSelectChangeCB: Function[] = [];
  // static selectedLines: number[] = [];

  static syntaxTree: SyntaxTree | null = null;

  // This is pretty important
  static tokenState = {
    tokens: [] as string[],
  };

  static onUpdate(message: any) {
    let filtered = Tokenizer.condenseTree(message);

    if (filtered != null) {
      this.syntaxTree = new SyntaxTree(filtered);
      this.redraw();
    }
  }

  static requestUpdate() {
    vscode.postMessage({
      type: "requestUpdate",
    });
  }

  static redraw() {
    if (this.syntaxTree === null) {
      console.error("Syntax tree is null, cannot redraw");
      return;
    }

    Editor.tokenChangeCB.forEach((cb) => cb(this.syntaxTree!.root));
  }

  static writeText(text: string) {
    // Send message back to vscode
    vscode.postMessage({
      type: "update",
      text: text,
    });
  }

  static setMockSyntaxTree(tree: SyntaxTree) {
    this.syntaxTree = tree;
    this.redraw();
  }
}
