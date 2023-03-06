import * as path from 'path';

export default class MyTokenizer {

    static tokenize(context: any, text: string): any {
        
        let Parser = require('web-tree-sitter');

        Parser.init().then(() => {
            let parser = new Parser();

            let grammarPath = context.asAbsolutePath(path.join('src', 'grammars', 'tree-sitter-javascript.wasm'));

            Parser.Language.load(grammarPath).then((js) => {
                parser.setLanguage(js);

                let tree = parser.parse(text);
                console.log(tree);

                return tree;
            });
        });

    }

    private static processWASMTree(tree: any): any {

        // Go through and grab indices, types, children, and text



    }

}