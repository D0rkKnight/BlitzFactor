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
		vscode.commands.executeCommand('workbench.action.splitEditorRight');
		vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(vscode.window.activeTextEditor?.document.fileName as string), 'blitzEditors.blitzEditor');
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

			let toExecute = actions[0];
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
		});
	}));

	let tokenizerPromise = Tokenizer.initialize(context);
	context.subscriptions.push(vscode.commands.registerCommand('blitzFactor.printAST', () => {

		Tokenizer.tokenize(vscode.window.activeTextEditor?.document.getText() as string);

	}));

	return {
		context: context,
		tokenizer: {class: Tokenizer, initPromise: tokenizerPromise}
	};
}

// This method is called when your extension is deactivated
export function deactivate() {}
