import * as path from 'path';
import * as tempTree from './editor_frontend/cosmos/sampleTokens';
import { TokenType } from './tokenTypes';
import Token from './token';

export default class MyTokenizer {

    static parser = null as any;
    static context = null as any;
    static tokenizerReady = false;

    static initialize(context: any) {
        if (this.parser) return;
        this.context = context;

        let Parser = require('web-tree-sitter');

        Parser.init().then(() => {
            this.parser = new Parser();

            let grammarPath = context.asAbsolutePath(path.join('src', 'grammars', 'tree-sitter-javascript.wasm'));

            Parser.Language.load(grammarPath).then((language: any) => {
                if (this.parser) {
                    this.parser.setLanguage(language);
                    console.log("Parser initialized with language")

                    this.tokenizerReady = true;
                }
                else
                    console.log("Parser not initialized");
            });
        });
    }


    static tokenize(text: string): any {
        
        if (!this.tokenizerReady) {
            console.log("Parser not initialized, awaiting initialization");
            console.log("Take this temporary JSON for now");

            return tempTree;
        }

        let tree = this.parser.parse(text);
        // console.log(tree.rootNode.toString());

        let json = this.WASMtoJSON(tree.rootNode, text);
        // console.log(JSON.stringify(json, null, 2));

        // let condensed = this.condenseJSON(json);
        // console.log(JSON.stringify(condensed, null, 2));

        return json;

    }

    // Convert to JSON since this gives us a Cosmos testable format and a way to generalize to other tokenizers 
    private static WASMtoJSON(node: any, text: string): any {



        let json = {
            "type": this.WASMTypeToTokenType(node.type),
            "rawType": node.type,
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
            case "(":
            case ")":
            case "{":
            case "}":
            case ";":
            case ",":
            case ".":
            case "[":
            case "]":
                return TokenType.punctuation;
            default:
                return TokenType.other;
        }
    }

    public static condenseJSON(json: any) {

        // Condense function headers for example into a single node
        // Cuz it turns out that visual blocking is not the same as code blocking

        let newJson = {... json};
        newJson['children'] = [];

        // Delete all punctuation (punctuation are leaf nodes so we can just cull them)
        if (json['type'] == TokenType.punctuation)
            return null;

        for (let i = 0; i < json['children'].length; i++) {
            let child = json['children'][i];

            let newChild = this.condenseJSON(child);

            if (newChild != null)
                newJson['children'].push(newChild);
        }

        // Recalculate start and end positions since deleting leaf nodes may shift our bounds
        if (newJson['children'].length > 0) {
            newJson['start'] = newJson['children'][0]['start'];
            newJson['end'] = newJson['children'][newJson['children'].length - 1]['end'];
        }

        return newJson;
    }
}