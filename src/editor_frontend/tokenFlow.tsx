import * as React from "react";

import Editor from "./editor";
import Highlighter from "./Highlighter";
import Token from "../token";
import TokenBlock from "./tokenBlock";

export default function TokenFlow({ tree }) {
  // Just increment this or something when we want to rerender
  const [state, setstate] = React.useState(0);

  /**
   * General function to set hover state
   * @param val Value to set hover to
   */
  function setHover(val: boolean, token: Token) {
    // Edit highlighted set in editor
    Highlighter.setHighlightInclusion(token, val);

    setstate(state + 1); // This triggers the rerender
  }

  return Token.tokenToReact(tree as Token, false, setHover, false);
}
