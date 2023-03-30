import Tokenizer from "../tokenizer";
import SyntaxTree from "./SyntaxTree";
import Token from "../token";
import CodeActionDescription from "../CodeActionDescription";

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

  static onUpdate(message: Token) {
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

  static renameTokenTo(token: Token, newName: string) {
    vscode.postMessage({
      type: "renameToken",
      body: {
        token: token,
        newName: newName,
      },
    });
  }

  static retrieveCodeActions(toks: Token[]) {
    vscode.postMessage({
      type: "retrieveCodeActions",
      body: {
        tokens: toks,
      },
    });
  }

  static actionCache: CodeActionDescription[] = [];

  static setCodeActionCache(actions: CodeActionDescription[]) {
    this.actionCache = actions;
  }

  static performAction(actionName: string, vars: any) {
    vscode.postMessage({
      type: "performAction",
      body: {
        actionName: actionName,
        vars: vars,
      },
    });
  }

  static getMapperMenuVars(actionName: string): string[] | undefined {
    if (this.actionCache.length === 0) return [];

    return this.actionCache.find((action) => action.title === actionName)
      ?.variables;
  }
}
