// import React, { useState } from "react";
// import TokenBlock from "../editor_frontend/tokenBlock";
// import Token from "../token";
// import { TokenType } from "../tokenTypes";
// import Tokenizer from "../tokenizer";

// export default function TokenizerDecorator({ children }) {
//   const [text, setText] = useState("hello");

//   // When the input changes, update the children text
//   let tok = new Token(
//     TokenType.identifier,
//     "identifier",
//     [0, 0],
//     [0, 0],
//     text,
//     [],
//     0
//   );
//   React.useEffect(() => {
//     // tok.text = text;

//     // Load up tokenizer
//     let context = {
//       asAbsolutePath: (path: string) => path,
//     };
//     Tokenizer.initialize(context).then(() => {
//       // Tokenize the text
//       let tree = Tokenizer.tokenize(text);
//       console.log(tree);
//       tok = tree;
//     });
//   }, [text]);

//   return (
//     <div>
//       <input value={text} onChange={(e) => setText(e.target.value)} />
//       <TokenBlock id={0} line={0} tree={tok} />
//       {children}
//     </div>
//   );
// }
