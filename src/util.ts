import * as vscode from 'vscode';
import Token from './token';
import TabStops from 'tabstops';
import { TokenType } from './tokenTypes';

export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function vscodeRangeFromToken(token: Token) {
	return new vscode.Range(token.start[0], token.start[1], token.end[0], token.end[1]);
}

export const varRegex = [/\$[a-zA-Z0-9_:]*\$/g, /\${[a-zA-Z0-9_:]*}/g];

export function fillInSnippetVars(str: string, vars: {}, document: vscode.TextDocument, token: Token | undefined): string {
	const tabstops = getTabstops(str)

	for (const key in vars) {
		const varValue = vars[key];

		if (varValue === undefined) {
			console.log('No variable name for tabstop ' + key);
			continue;
		}

		// Get the key with value key (ik confusing)
		let keyToSet = ""
		tabstops.tabstops.forEach((v, k) => {
			if (v === key) {
				keyToSet = k;
			}
		});

		tabstops.set(keyToSet, varValue);
	}

	return tabstops.render(envVars(document, token));
}

// Look for entries that match the regex
export function getSnippetVars(str: string): string[] {
	const variables: string[] = [];
	const tabstops = getTabstops(str);

	return Array.from(tabstops.tabstops.values()); // Not really sure if this in order, but whatever
};

export function getTabstops(snippet: string) {

	const tabstops = new TabStops(snippet);
	tabstops.render();

	return tabstops;
}

function envVars(document: vscode.TextDocument, token: Token | undefined) {

	if (token === undefined) {
		console.log("Token is undefined, this is bad");
		token = new Token(TokenType.other, "error", [0, 0], [0, 0], "ERROR", [], 0);
	}

	return {
		TM_SELECTED_TEXT: token.text, // Huh I guess this works
		TM_CURRENT_LINE: 'current line',
		TM_CURRENT_WORD: 'current word',
		TM_LINE_INDEX: 'line index',
		TM_LINE_NUMBER: 'line number',
		TM_FILENAME: 'filename',
		TM_FILENAME_BASE: 'filename base',
		TM_DIRECTORY: 'directory',
		TM_FILEPATH: 'filepath',
		TM_FULLNAME: 'fullname',
		TM_SCOPE: 'scope',
		TM_TAB_SIZE: 'tab size',
		TM_SOFT_TABS: 'soft tabs',
		TM_LINE_INDENT: 'line indent',
		TM_LINE_INDENT_CURRENT: 'line indent current',
		TM_CURRENT_LINE_INDEX: 'current line index',
		TM_CURRENT_LINE_NUMBER: 'current line number',
		TM_CURRENT_SCOPE: 'current scope',
	};
}
