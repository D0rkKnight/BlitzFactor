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

export function fillInSnippetVars(str: string, vars: any) {
	str = str.replace(/\$[a-zA-Z0-9_:]*\$/g, (match, p1) => {
		if (vars[match] === undefined) {
			console.log('Undefined variable: ' + match);
			return;
		}

		return vars[match];
	});

	// Do it again for the other var format
	str = str.replace(/\${[a-zA-Z0-9_:]*}/g, (match, p1) => {
		if (vars[match] === undefined) {
			console.log('Undefined variable: ' + match);
			return;
		}

		return vars[match];
	});
	return str;
}
