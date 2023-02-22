import path = require('path');
import { getNonce } from './util';
import * as vscode from 'vscode';

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
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
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

		console.log(e);

		switch (e.type) {
			case 'update':
				const textEditor = vscode.window.activeTextEditor;
				if (textEditor != null && textEditor.document.uri.toString() === document.uri.toString()) {
					// Replace the text of the document
					let edit = new vscode.WorkspaceEdit();
					let firstLine = document.lineAt(0);
					let lastLine = document.lineAt(document.lineCount - 1);
					let range = new vscode.Range(firstLine.range.start, lastLine.range.end);
					edit.replace(document.uri, range, e.text);
					vscode.workspace.applyEdit(edit);
				}
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
			this.context.extensionUri, 'media', 'style.css'));

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
}

exports.BlitzEditorProvider = BlitzEditorProvider;