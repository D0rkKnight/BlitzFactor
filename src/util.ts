import * as vscode from 'vscode';
import Token from './token';

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

export function fillInSnippetVars(str: string, vars: string[], regex: RegExp[] = varRegex) {
	return parseSnippet(str, [/\$[a-zA-Z0-9_:]*\$/g, /\${[a-zA-Z0-9_:]*}/g], (match) => {
		if (vars[match] === undefined) {
			console.log('Undefined variable: ' + match);
			return;
		}

		return vars[match];
	});
}

export function parseSnippet(snippet: string, regex: RegExp[], onVarFound: (match: string) => string) {

	regex.forEach(element => {
		snippet = snippet.replace(element, (match, p1) => {
			return onVarFound(match);
		});
	});

	return snippet;
}