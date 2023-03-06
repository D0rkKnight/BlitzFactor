// import PJavaScript = require("tree-sitter-javascript");

export default class Tokenizer {

    static tokenize(text: string): any {
        
        console.log("Tokenizing input!")
        
        let Parser = require("tree-sitter");
        
        // const parser = new Parser();
        // parser.setLanguage(PJavaScript);

        // const tree = parser.parse(text);

        // console.log(tree)

    }

}