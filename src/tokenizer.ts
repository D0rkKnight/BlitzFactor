import * as path from 'path';

export default class Tokenizer {

    static tokenize(context: any, text: string): any {
        
        console.log("Tokenizing input!")
        
        let Parser = require('web-tree-sitter');

        Parser.init().then(() => {
            let parser = new Parser();

            let grammarPath = context.asAbsolutePath(path.join('src', 'grammars', 'tree-sitter-javascript.wasm'));

            Parser.Language.load(grammarPath).then((js) => {
                parser.setLanguage(js);

                let tree = parser.parse(text);
                console.log(tree.rootNode.toString());
            });
        });

    }

}