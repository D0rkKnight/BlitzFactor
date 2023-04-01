import path = require('path');
import { getNonce, vscodeRangeFromToken, fillInSnippetVars, getTabstops, varRegex, getSnippetVars } from './util';
import * as vscode from 'vscode';
import Tokenizer from './tokenizer';
import Token from './token';
import { CodeActionDescription, SnippetDescription } from './ActionDescriptions';
import CustomAction from './CustomAction';

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
	private snippetCache: vscode.SnippetString[] = [];
	private snDescCache: SnippetDescription[] = [];

	// Execute anything with these :3
	private customActions: CustomAction[] = [];

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
				case 'retrieveActions':
					this.fillActionCache(document, e.body.tokens).then(() => {

						// Send the code actions back
						webviewPanel.webview.postMessage({
							type: 'sendActions',
							body: {
								caDesc: this.caDescCache, 
								snDesc: [{name: 'Test Snippet', snippet: 'This is a test snippet'}, {name: 'Test Snippet 2', snippet: 'This is a test snippet 2'}],
								customDesc: this.customActions.map(ca => ca.getDescription())
							}
						});
					});
					break;
				case 'performAction':
					// May be async
					this.performAction(document, e.body.actionName, e.body.vars);
					break;
				case 'performCustomAction':
					// May be async
					this.performCustomAction(document, e.body.customAction.title, e.body.variables, e.body.tokens);
					break;
			}
		}
		);

		// Generate custom actions
		this.customActions = this.generateCustomActions();

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
					const varsInEdit = getSnippetVars(edit.newText);
					variables.push(...varsInEdit);
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

	async performAction(document: vscode.TextDocument, actionName: string, vars: {}) {
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

	async performActionRaw(document: vscode.TextDocument, action: vscode.CodeAction, description: CodeActionDescription, vars: {}, postProcess?: () => void) {
		// Apply the edits (this needs to happen first)
		const edit = action.edit as vscode.WorkspaceEdit;
		const token = description.token;

		if (edit !== undefined) {

			// Get every text edit's text
			const textEdits = edit.entries();

			// Fill in variables
			textEdits.forEach((textEdit) => {
				const [uri, edits] = textEdit;
				edits.forEach((edit) => {
					edit.newText = fillInSnippetVars(edit.newText, vars, document, token);
				});
			});

			vscode.workspace.applyEdit(edit as vscode.WorkspaceEdit);
		}

		// Command that gets run after
		if (action.command !== undefined) {
			let command = action.command.command;
			let args = action.command.arguments;
			let allArgs = [command].concat(args!);

			await vscode.commands.executeCommand.apply(null, allArgs as any);
		}

		// Some after the fact processing
		if (postProcess !== undefined)
				postProcess();
	}

	async fillActionCache(document: vscode.TextDocument, tokens: Token[]) {

		const caPromise = this.retrieveCodeActions(document, tokens).then((out: {actions: vscode.CodeAction[], descriptions: CodeActionDescription[]}) =>  {
			this.codeActionCache = out.actions;
			this.caDescCache = out.descriptions;
		});

		const snippedPromise = this.retrieveSnippets(document, tokens).then((out: {snippets: vscode.SnippetString[], descriptions: SnippetDescription[]}) => {
			this.snippetCache = out.snippets;
			this.snDescCache = out.descriptions;
		});

		await caPromise;
		return;
	}

	async retrieveSnippets(document: vscode.TextDocument, tokens: Token[]): Promise<{ snippets: vscode.SnippetString[], descriptions: SnippetDescription[]}> {

		//
		// const snippets = await vscode.commands.executeCommand('editor.action.insertSnippet');

		console.log("This isn't going to work for a bit");
		

		return {snippets: [], descriptions: []};
	}

	generateCustomActions(): CustomAction[] {

		const customActions: CustomAction[] = [];

		customActions.push( new CustomAction("Action 1", ["var1", "var2"], async (doc: vscode.TextDocument, tok: Token, variables: {}) => {
			console.log(variables["var1"]);
			return undefined;
		}));
	
		customActions.push( new CustomAction("Action 2", undefined, async (doc: vscode.TextDocument, tok: Token, variables: {}) => {
			console.log("Action 1");
			return undefined;
		}));

		customActions.push( new CustomAction("Dependency Inversion", undefined, async (doc: vscode.TextDocument, tok: Token, variables: {}) => {

			// Make new file for interface
			


			return undefined;
		}));

		return customActions;


	}

	async performCustomAction(document: vscode.TextDocument, actionName: string, vars: {}, tok: Token) {
		const action = this.customActions.find((action) => action.title === actionName)!;
		const edit: vscode.WorkspaceEdit | undefined = await action.execute(document, tok, vars);

		if (edit !== undefined) {
			await vscode.workspace.applyEdit(edit);
		}
	}

}

exports.BlitzEditorProvider = BlitzEditorProvider;
