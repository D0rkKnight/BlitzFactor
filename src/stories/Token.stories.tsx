import React from "react";

import TokenBlock from "../editor_frontend/tokenBlock";
import Token from "../token";
import { TokenType } from "../tokenTypes";

export default {
  title: "Example/Token",
  component: TokenBlock,
};

let tok = new Token(
  TokenType.identifier,
  "identifier",
  [0, 0],
  [0, 0],
  "identifier",
  [],
  0
);

export const Default = () => Token.tokenToReact(tok);

// export default {
//   title: "Example/Token",
//   component: () => <div>hi</div>,
// };

// export const Default = () => <div>hi</div>;
