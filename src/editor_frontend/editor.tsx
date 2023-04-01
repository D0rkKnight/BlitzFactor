import Tokenizer from "../tokenizer";
import SyntaxTree from "./SyntaxTree";
import Token from "../token";
import {
  CodeActionDescription,
  SnippetDescription,
} from "../ActionDescriptions";
import { CustomActionDescription } from "../CustomAction";
import Highlighter from "./Highlighter";

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
  static syntaxTree: SyntaxTree | null = null;

  // This is pretty important
  static tokenState = {
    tokens: [] as string[],
  };

  static init() {
    // Editor.lineSelectChangeCB.push((newSelectedLines: number[]) => {
    //   var cloned = newSelectedLines.slice();
    //   setSelectedLines(cloned);
    // })

    // // Put in key listeners for editor
    // document.addEventListener('keydown', (event) => {
    //   Editor.onKeyPress(event);
    // });

    // // Put in key listeners for editor
    // document.addEventListener('keyup', (event) => {
    //   Editor.onKeyUp(event);
    // });

    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.type) {
        case "update":
          Editor.onUpdate(message.tree);
          break;
        case "sendActions":
          Editor.setActionCache(message.body);
          break;
      }
    });
  }

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

  static retrieveActions(toks: Token[]) {
    vscode.postMessage({
      type: "retrieveActions",
      body: {
        tokens: toks,
      },
    });
  }

  static codeActionDescriptions: CodeActionDescription[] = [];
  static snippetDescriptions: SnippetDescription[] = [];
  static customDescriptions: CustomActionDescription[] = [];

  static setActionCache(actions: {
    caDesc: CodeActionDescription[];
    snDesc: SnippetDescription[];
    customDesc: CustomActionDescription[];
  }) {
    this.codeActionDescriptions = actions.caDesc;
    this.snippetDescriptions = actions.snDesc;
    this.customDescriptions = actions.customDesc;
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

  static performCustomAction(cu: CustomActionDescription, vars: {}) {
    vscode.postMessage({
      type: "performCustomAction",
      body: {
        customAction: cu,
        tokens: [Highlighter.rightClickQueried],
        variables: vars,
      },
    });
  }

  static getMapperMenuVars(actionName: string): string[] | undefined {
    if (this.codeActionDescriptions.length === 0) return [];

    return this.codeActionDescriptions.find(
      (action) => action.title === actionName
    )?.vars;
  }
}
