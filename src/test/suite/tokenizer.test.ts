import assert from 'assert';
import * as sinon from 'sinon';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import SyntaxTree from '../../editor_frontend/SyntaxTree';
import Highlighter from '../../editor_frontend/Highlighter';
import Tokenizer from '../../tokenizer';
import Token from '../../token';
import { TokenType } from '../../tokenTypes';

suite('Syntax Tree Test Suite', () => {
	vscode.window.showInformationMessage('Starting Syntax Tree tests.');

    let Tokenizer;

    suiteSetup(async () => {
        // This activates the tokenizer already
        // Tokenizer returned seems to be on separate prototype chain from the one you would import here
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

    test('Syntax Tree test', () => {
        let root = Tokenizer.tokenize("let x = 5;");

        let st = new SyntaxTree(root);

        assert(st.root.children.length === 1, "Root should have 1 child");
    })

    test('Token find in child test', () => {
        let root = Tokenizer.tokenize("let x = 5;") as Token;
        let st = new SyntaxTree(root);

        let found = root.findTextInChildren("x");
        assert(found !== undefined, "Token should be found");
    })

    test('SyntaxTree backlink test', () => {
        let root = Tokenizer.tokenize("let x = 5;") as Token;
        let st = new SyntaxTree(root);

        // Go through every token and check that the backlink is correct
        let tokens = st.root.getAllTokens();
        for (let token of tokens) {
            let parent = st.backlinks.get(token);

            // Root doesn't have a parent
            if (token === st.root) {
                continue;
            }

            assert(parent?.children.includes(token), "Backlink should be a parent of token");
        }
    })

    test('Highlighter test', () => {
        let root = Tokenizer.tokenize("let x = 5;") as Token;
        let st = new SyntaxTree(root);

        let hlTarget = st.root.findTextInChildren("let");
        assert(hlTarget !== undefined, "Token should be found");

        let adj = Highlighter.getAdjustedFromDeepest(hlTarget, st);
        assert(adj !== undefined, "Token should be found");

        // Assert we found the program block
        assert(adj?.type === TokenType.program, "Token should be a program block");


        // Try it for the x block now
        hlTarget = st.root.findTextInChildren("x");
        assert(hlTarget !== undefined, "Token should be found");

        adj = Highlighter.getAdjustedFromDeepest(hlTarget, st);
        assert(adj !== undefined, "Token should be found");
        

        // Highlighter.setHighlightInclusion()
    })
});
