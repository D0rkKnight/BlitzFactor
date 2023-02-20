import * as vscode from 'vscode';

Object.defineProperty(exports, "__esModule", { value: true });
exports.TxtEditorProvider = void 0;

export class TxtEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new TxtEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(TxtEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'testEditors.txtEditor';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void {
    webviewPanel.webview.options = {
      enableScripts: true
    };
    
    webviewPanel.webview.html = `
    <html>
    <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; script-src vscode-resource:; style-src vscode-resource:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
    <textarea id="editor" style="width:100%; height:100%"></textarea>
    <script src="${webviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'txtEditor.js'))}"></script>
    </body>
    </html>
    `;
    
    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      });
    }
    
    // Print out hello!
    console.log('Hello!');
    
    webviewPanel.webview.onDidReceiveMessage((message: { command: any; text: string; }) => {
      switch (message.command) {
        case 'update':
          const textDocumentEdit = new vscode.WorkspaceEdit();
          textDocumentEdit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            message.text
          );
          vscode.workspace.applyEdit(textDocumentEdit);
          break;
      }
    });


    updateWebview();
  }
}

exports.TxtEditorProvider = TxtEditorProvider;