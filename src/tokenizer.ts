import * as path from 'path';

enum TokenType {
    identifier,
    function_declaration,
    formal_parameters,
    statement_block,
    other
}

export default class MyTokenizer {

    static parser = null as any;

    static initialize(context: any) {
        let Parser = require('web-tree-sitter');

        Parser.init().then(() => {
            this.parser = new Parser();

            let grammarPath = context.asAbsolutePath(path.join('src', 'grammars', 'tree-sitter-javascript.wasm'));

            Parser.Language.load(grammarPath).then((language: any) => {
                if (this.parser) {
                    this.parser.setLanguage(language);
                    console.log("Parser initialized with language")
                }
                else
                    console.log("Parser not initialized");
            });
        });
    }


    static tokenize(context: any, text: string): any {
        
        if (!this.parser)
            throw new Error("Parser not initialized");

        let tree = this.parser.parse(text);
        console.log(tree.rootNode.toString());

        let json = this.WASMtoJSON(tree.rootNode, text);
        console.log(JSON.stringify(json, null, 2));

        return json;

    }

    // Convert to JSON since this gives us a Cosmos testable format and a way to generalize to other tokenizers 
    private static WASMtoJSON(node: any, text: string): any {

        let json = {
            "type": this.WASMTypeToTokenType(node.type),
            "start": node.startPosition,
            "end": node.endPosition,
            "text": node.text,
            "children": [] as any[],
        };

        for (let i = 0; i < node.childCount; i++) {
            let child = node.children[i];
            json.children.push(this.WASMtoJSON(child, text));
        }

        return json;
    }

    // Hacky hack
    private static WASMTypeToTokenType(type: string): TokenType {
        switch (type) {
            case "identifier":
                return TokenType.identifier;
            case "function_declaration":
                return TokenType.function_declaration;
            case "formal_parameters":
                return TokenType.formal_parameters;
            case "statement_block":
                return TokenType.statement_block;
            default:
                return TokenType.other;
        }
    }
}