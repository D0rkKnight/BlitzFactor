import path = require('path');
import { getNonce } from './util';
import * as vscode from 'vscode';
import MyTokenizer from './tokenizer';

Object.defineProperty(exports, "__esModule", { value: true });
exports.BlitzEditorProvider = void 0;

export class BlitzEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new BlitzEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(BlitzEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'blitzEditors.blitzEditor';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void {
    webviewPanel.webview.options = {
      enableScripts: true
    };
    
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
    
    function updateWebview() {
		let tree = MyTokenizer.tokenize(document.getText());

		webviewPanel.webview.postMessage({
			type: 'update',
			tree: tree,
		});
    }

	// Update web view on document change
	const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
		if (e.document.uri.toString() === document.uri.toString()) {
			updateWebview();
		}
	});
    
	// Listen for messages from the webview
	webviewPanel.webview.onDidReceiveMessage(e => {

		switch (e.type) {
			case 'update':
				this.updateTextDocument(document, e.text);
				break;
			case 'requestUpdate':
				updateWebview();
			}
		}
	);

    // Print out hello!
    console.log('Blitz Editor accessed');

    updateWebview();
  }

  
	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'dist', 'editor.js'));

		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'src/editor_frontend', 'style.css'));

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleUri}" rel="stylesheet" />

				<title>Cat Scratch</title>
			</head>
			<body>
				<div id="app"></div>
				
				<script nonce="${nonce}" type="module" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

		/**
	 * Write out the json to a given document.
	 */
		private updateTextDocument(document: vscode.TextDocument, txt: string) {
			const edit = new vscode.WorkspaceEdit();
	
			// Just replace the entire document every time for this example extension.
			// A more complete extension should compute minimal edits instead.
			edit.replace(
				document.uri,
				new vscode.Range(0, 0, document.lineCount, 0),
				txt);
				
			// Print out entire document text
			var outcome = vscode.workspace.applyEdit(edit);
			console.log(document.getText());

			return outcome;
		}
}

exports.BlitzEditorProvider = BlitzEditorProvider;