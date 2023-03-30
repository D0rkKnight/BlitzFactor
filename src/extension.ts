// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BlitzEditorProvider } from './blitzEditor';
import Tokenizer from './tokenizer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "blitzfactor" is now active!');

	let openSidePanel = vscode.commands.registerCommand('blitzFactor.sidePreview', () => {

		// Create a split view and launch the blitz editor for the active file
		// vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(vscode.window.activeTextEditor?.document.fileName as string), 'blitzEditors.blitzEditor');

		// Create a new editor window
		vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(vscode.window.activeTextEditor?.document.fileName as string), 'blitzEditors.blitzEditor', { viewColumn: vscode.ViewColumn.Beside });

	});

	context.subscriptions.push(openSidePanel);
	context.subscriptions.push(
		BlitzEditorProvider.register(context));

	context.subscriptions.push(vscode.commands.registerCommand('blitzFactor.printActions', () => {

		// Get cursor position
		let cursorPosition = vscode.window.activeTextEditor?.selection.active;
		let uri = vscode.window.activeTextEditor?.document.uri;

		// Get selection
		let selection = vscode.window.activeTextEditor?.selection;
		let possibleActions = vscode.commands.executeCommand('vscode.executeCodeActionProvider', uri, selection);

		console.log("Querying possible actions", possibleActions)

		// Pick the first action and perform it
		possibleActions.then((actions: any) => {
			if (actions.length === 0) {
				console.log('No actions available');
				return;
			}

			if (actions[0] === undefined) {
				console.log('Action is not defined');
				return;
			}

			console.log("All actions: ");
			console.log(actions);

			let toExecute = actions[1];
			console.log('Executing action: ');
			console.log(toExecute);

			let command = toExecute.command.command;
			let args = toExecute.command.arguments;

			console.log('Executing command: ' + command);
			console.log('With arguments: ');
			console.log(args);

			let allArgs = [command].concat(args);
			console.log('All arguments: ');
			console.log(allArgs);

			vscode.commands.executeCommand.apply(null, allArgs as any);

			// vscode.commands.executeCommand("function_scope_0", allArgs as any);
		});
	}));

	let tokenizerPromise = Tokenizer.initialize(context);
	context.subscriptions.push(vscode.commands.registerCommand('blitzFactor.printAST', () => {

		Tokenizer.tokenize(vscode.window.activeTextEditor?.document.getText() as string);

	}));

	context.subscriptions.push(vscode.commands.registerCommand('blitzFactor.renameTest', () => {

		// Get cursor position
		let cursorPosition = vscode.window.activeTextEditor?.selection.active;

		// Get selection
		let selection = vscode.window.activeTextEditor?.selection;

		// Get the current document
		let document = vscode.window.activeTextEditor?.document;

		// Get uri of the document
		let uri = vscode.window.activeTextEditor?.document.uri;

		// Perform a rename on the current selected symbol
		vscode.commands.executeCommand("vscode.executeDocumentRenameProvider", uri, cursorPosition, "hoogyboody").then((result: any) => {

			// Apply the edits
			vscode.workspace.applyEdit(result as vscode.WorkspaceEdit);

		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('blitzFactor.snippetTest', () => {

		// Get cursor position
		let uri = vscode.window.activeTextEditor?.document.uri;

		// Get selection
		let selection = vscode.window.activeTextEditor?.selection;
		let possibleActions = vscode.commands.executeCommand('vscode.executeCodeActionProvider', uri, selection);

		possibleActions.then((actions: any) => {

			// Pick the first action and perform it

			if (actions.length === 0) {
				console.log('No actions available');
				return;
			}

			const action = actions[2];

			let snippet = "${1:array}.forEach(${2:element} => {\n\t$TM_SELECTED_TEXT$0\n});";

			const snippetString = new vscode.SnippetString(snippet);
			const editor = vscode.window.activeTextEditor!;
			const insertPos = editor?.selection.active;
			const edit = new vscode.WorkspaceEdit();
			edit.set(editor.document.uri, [vscode.SnippetTextEdit.insert(insertPos, snippetString)])

			void vscode.workspace.applyEdit(edit)

			// Call it with the name

			// editor.insertSnippet(action.edit as vscode.SnippetString);


			// vscode.workspace.applyEdit(action.edit as vscode.WorkspaceEdit);
			// vscode.commands.executeCommand("editor.action.insertSnippet", {"snippet": "${1:array}.forEach(${2:element} => {\n\t$TM_SELECTED_TEXT$0\n});"});
		});


	}));

	return {
		context: context,
		tokenizer: { class: Tokenizer, initPromise: tokenizerPromise }
	};
}

// This method is called when your extension is deactivated
export function deactivate() { }
