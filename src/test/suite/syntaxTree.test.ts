import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import SyntaxTree from '../../editor_frontend/SyntaxTree';
// import * as myExtension from '../../extension';

suite('Syntax Tree Test Suite', () => {
	vscode.window.showInformationMessage('Starting Syntax Tree tests.');

    let Tokenizer;

    suiteSetup(async () => {
        // This activates the tokenizer already
        let {tokenizer} = await vscode.extensions.getExtension('dorkknight.blitzfactor')?.activate();

        await tokenizer.initPromise;
        Tokenizer = tokenizer.class;
    });

	test('Tokenizer parse', () => {
        // Build a syntax tree from a json file
        let json = Tokenizer.tokenize("let x = 5;");
        console.log(json);
	});
});
