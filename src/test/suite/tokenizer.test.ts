import assert from 'assert';
import * as sinon from 'sinon';

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
	});

    test('Spy test', () => {
        let spy = sinon.spy(Tokenizer, 'WASMtoTREE');
        let json = Tokenizer.tokenize("let x = 5;");

        assert(spy.callCount === 8, "WASMtoTREE should be called 8 times");
        spy.restore();
    })

    test('Mock test', () => {
        let mock = sinon.mock(Tokenizer);

        // Replaces this function call with an undefined return value
        // And adds an expectation that it will be called at least once
        mock.expects('WASMtoTREE').atLeast(1);

        let json = Tokenizer.tokenize("let x = 5;");

        mock.verify();
    })
});
