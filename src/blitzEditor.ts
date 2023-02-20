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
			this.context.extensionUri, 'media', 'script.ts'));

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
				<h1>Blitz Factor</h1>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

exports.BlitzEditorProvider = BlitzEditorProvider;