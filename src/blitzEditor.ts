import path = require('path');
import { getNonce } from './util';
import * as vscode from 'vscode';
import Tokenizer from './tokenizer';
import Token from './token';

Object.defineProperty(exports, "__esModule", { value: true });
exports.BlitzEditorProvider = void 0;

export class BlitzEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new BlitzEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(BlitzEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'blitzEditors.blitzEditor';

	constructor(private readonly context: vscode.ExtensionContext) { }

	private codeActionCache: any = {};

	public resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void {
		webviewPanel.webview.options = {
			enableScripts: true
		};

		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			let tree = Tokenizer.tokenize(document.getText());

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
					break;
				case 'renameToken':
					this.renameToken(document, e.body.token, e.body.newName);
					break;
				case 'retrieveCodeActions':
					const codeActionPromise = this.retrieveCodeActions(document, e.body.tokens);


					codeActionPromise.then((codeActions: any) => {
						this.codeActionCache = codeActions;

						// Get only the names
						const names = codeActions.map((action: any) => action.title);

						// Send the code actions back
						webviewPanel.webview.postMessage({
							type: 'codeActions',
							body: {
								actionNames: names,
							}
						});
					});
					break;
				case 'performAction':
					// May be async
					this.performAction(document, e.body.actionName);
					break;
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

		// PREV CSP: <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->

				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleUri}" rel="stylesheet" />

				<title>Blitz Editor</title>
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

	renameToken(document: vscode.TextDocument, token: Token, newName: string) {
		let uri = document.uri;
		let position = new vscode.Position(token.start[0], token.start[1]);

		// Perform a rename on the current selected symbol
		vscode.commands.executeCommand("vscode.executeDocumentRenameProvider", uri, position, newName).then((result: any) => {

			// Apply the edits
			vscode.workspace.applyEdit(result as vscode.WorkspaceEdit);

		});
	}

	async retrieveCodeActions(document: vscode.TextDocument, tokens: Token[]) {

		let uri = document.uri;
		let selections = tokens.map((token) => {
			return new vscode.Selection(token.start[0], token.start[1], token.end[0], token.end[1]);
		});


		// Get selection
		let selection = selections[0]
		let possibleActions = await vscode.commands.executeCommand('vscode.executeCodeActionProvider', uri, selection);

		return possibleActions;
	}

	async performAction(document: vscode.TextDocument, actionName: string) {
		// Get action from cache
		let action: vscode.CodeAction = this.codeActionCache.find((action: any) => action.title === actionName);

		// Typescript refactors need to be resolved before their edits are exposed
		// We also dodge the telemetry call with this, for whatever it's worth.
		if (action.command?.command.startsWith('_typescript')) {
			const cancelTok = new vscode.CancellationTokenSource();

			if (action.command?.arguments === undefined) {
				console.log('No arguments for Typescript action');
				return;
			}

			for (let i = 0; i < action.command.arguments.length; i++) {
				const act = action.command?.arguments[i].codeAction;
				await act.resolve(cancelTok.token)

				// Don't perform the parent action, just chain the children actions.
				this.performActionRaw(document, act);
			}
		}
		else {
			this.performActionRaw(document, action);
		}
	}

	async performActionRaw(document: vscode.TextDocument, action: vscode.CodeAction) {
		// Apply the edits (this needs to happen first)
		const edit = action.edit as vscode.WorkspaceEdit;

		if (edit !== undefined) {

			// Get every text edit's text
			const textEdits = edit.entries();

			// Fill in variables
			textEdits.forEach((textEdit) => {
				const [uri, edits] = textEdit;

				edits.forEach((edit) => {

					// Some regex that ChatGPT came up with
					let newText = edit.newText.replace(/\$[a-zA-Z0-9_:]*\$/g, (match, p1) => {
						// return this.variableMap[p1];

						console.log(match)
						return 'test';
					});

					// Do it again for the other var format
					newText = newText.replace(/\${[a-zA-Z0-9_:]*}/g, (match, p1) => {
						// return this.variableMap[p1];

						console.log(match)
						return 'test';
					});

					edit.newText = newText;
				});
			});


			vscode.workspace.applyEdit(action.edit as vscode.WorkspaceEdit);
		}

		// Command that gets run after
		if (action.command !== undefined) {
			let command = action.command.command;
			let args = action.command.arguments;

			let allArgs = [command].concat(args!);
			console.log(allArgs);

			vscode.commands.executeCommand.apply(null, allArgs as any);
		}
	}
}

exports.BlitzEditorProvider = BlitzEditorProvider;