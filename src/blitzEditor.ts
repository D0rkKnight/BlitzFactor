import path = require('path');
import { getNonce, vscodeRangeFromToken, fillInSnippetVars } from './util';
import * as vscode from 'vscode';
import Tokenizer from './tokenizer';
import Token from './token';
import CodeActionDescription from './CodeActionDescription';

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

	private codeActionCache: vscode.CodeAction[] = [];
	private caDescCache: CodeActionDescription[] = [];

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


					codeActionPromise.then((codeActions: { actions: vscode.CodeAction[], descriptions: CodeActionDescription[]}) => {
						this.codeActionCache = codeActions.actions;
						this.caDescCache = codeActions.descriptions;

						// Send the code actions back
						webviewPanel.webview.postMessage({
							type: 'codeActions',
							body: this.caDescCache
						});
					});
					break;
				case 'performAction':
					// May be async
					this.performAction(document, e.body.actionName, e.body.vars);
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

		// Provide multiple css files
		const styleMin = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'dist', 'css', 'style.min.css'));
		
		const styleColors = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'dist', 'css', 'textColors.min.css'));

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

				<link rel="stylesheet" href="${styleMin}">
				<link rel="stylesheet" href="${styleColors}">

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
		this.renameUtil(document, new vscode.Position(token.start[0], token.start[1]), newName);
	}

	

	private renameUtil(document: vscode.TextDocument, pos: vscode.Position, newName: string) {
		let uri = document.uri;
		let position = pos;

		// Perform a rename on the current selected symbol
		vscode.commands.executeCommand("vscode.executeDocumentRenameProvider", uri, position, newName).then((result: any) => {

			// Apply the edits
			vscode.workspace.applyEdit(result as vscode.WorkspaceEdit);

		});
	}

	async retrieveCodeActions(document: vscode.TextDocument, tokens: Token[]): Promise<{ actions: vscode.CodeAction[], descriptions: CodeActionDescription[]}> {

		let uri = document.uri;
		let selections = tokens.map((token) => {
			return new vscode.Selection(token.start[0], token.start[1], token.end[0], token.end[1]);
		});


		// Get selection
		let selection = selections[0]
		let possibleActions: vscode.CodeAction[] = await vscode.commands.executeCommand('vscode.executeCodeActionProvider', uri, selection);

		// Go through the first order edits of each and extract any TextMate variables
		// This is a bit of a hack, but it's the only way to get the variable names
		// from the code actions.
		const snippetVars = possibleActions.map((action: vscode.CodeAction) => {
			if (action.edit !== undefined) {
				// For each edit
				const edits = action.edit.entries().flatMap(([uri, edits]) => edits);
				const variables: string[] = [];

				edits.forEach((edit) => {

					// Look for entries that match the regex
					// Just don't fill this in since this doesn't seem to incorporate variables
					// edit.newText.match(/\$[a-zA-Z0-9_:]*\$/g)?.forEach((match: string) => {

					// 	if (variables.indexOf(match) === -1) {
					// 		variables.push(match);
					// 	}

					// });

					edit.newText.match(/\${[a-zA-Z0-9_:]*}/g)?.forEach((match: string) => {
						
						if (variables.indexOf(match) === -1) {
							variables.push(match);
						}
					});
				});
				
				return variables;
			}
		});

		const descriptions: CodeActionDescription[] = possibleActions.map((action: vscode.CodeAction, index: number) => {
			return {
				title: action.title,
				variables: snippetVars[index],
				token: tokens[0] // Just use the first token for reference for now
			}
		});

		return {actions: possibleActions, descriptions: descriptions};
	}

	async performAction(document: vscode.TextDocument, actionName: string, vars: any) {
		// Get action from cache
		const action: vscode.CodeAction = this.codeActionCache.find((action: vscode.CodeAction) => action.title === actionName)!;
		const description: CodeActionDescription = this.caDescCache.find((desc: CodeActionDescription) => desc.title === actionName)!;

		// Typescript refactors need to be resolved before their edits are exposed
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
				this.performActionRaw(document, act, description, vars, () => {
					if (act.renameLocation !== undefined) {

						// Watch the off by one.
						this.renameUtil(document, new vscode.Position(act.renameLocation.line-1, act.renameLocation.offset-1), "Rename")
					}
				});
			}
		}
		else {
			this.performActionRaw(document, action, description, vars);
		}
	}

	async performActionRaw(document: vscode.TextDocument, action: vscode.CodeAction, description: CodeActionDescription, vars: any, postProcess?: () => void) {
		// Apply the edits (this needs to happen first)
		const edit = action.edit as vscode.WorkspaceEdit;

		const token = description.token;
		// Add in some vars like the selection
		const range = vscodeRangeFromToken(token);
		vars['$TM_SELECTED_TEXT$'] = document.getText(range);

		if (edit !== undefined) {

			// Get every text edit's text
			const textEdits = edit.entries();

			// Fill in variables
			textEdits.forEach((textEdit) => {
				const [uri, edits] = textEdit;

				edits.forEach((edit) => {

					// Some regex that ChatGPT came up with
					let newText = fillInSnippetVars(edit.newText, vars);

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

			await vscode.commands.executeCommand.apply(null, allArgs as any);
		}

		// Some after the fact processing
		// We need to update the document

		if (postProcess !== undefined) {

				postProcess(); // See if a timeout does anything

		}
	}
}

exports.BlitzEditorProvider = BlitzEditorProvider;
