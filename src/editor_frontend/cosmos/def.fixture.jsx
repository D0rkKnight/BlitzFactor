import React from "react";
import App from "../App";
import Token from "../../token";
import TokenBlock from "../tokenBlock";
import Editor from "../editor";
import Tokenizer from "../../tokenizer";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import '../style.css'

// Initialize parser, generate syntax tree, and feed to mock editor framework
// await Tokenizer.initialize();
// const syntaxTree = Tokenizer.parse("let x = 10;");
// Editor.syntaxTree = syntaxTree;

// require('web-tree-sitter')


// export default {
//     App: <App />,
//     Line: <DndProvider backend={HTML5Backend}><Token line="10">Test Line</Token></DndProvider>,

//     TokenBlock: Token.tokenToReact(syntaxTree),
// }

let tok = new Token("let", "keyword", 0, 0, "Hello", 0);

export default {
    test: <p> Working </p>,
    tok: Token.tokenToReact(tok),
}