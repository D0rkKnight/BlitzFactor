import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Editor from "./editor";
import TokenBlock from "./tokenBlock";
import TokenFlow from "./tokenFlow";
import Token from "../token";

export default function App() {
  const [tokens, setTokens] = React.useState(null as Token | null);
  const [selectedLines, setSelectedLines] = React.useState([] as number[]);

  React.useEffect(() => {
    Editor.tokenChangeCB.push((newTokens: Token) => {
      // var cloned = newTokens.slice();

      // TODO: Perform a deep copy
      let cloned = newTokens;
      setTokens(cloned);
    });

    // Editor.lineSelectChangeCB.push((newSelectedLines: number[]) => {
    //   var cloned = newSelectedLines.slice();
    //   setSelectedLines(cloned);
    // })

    // // Put in key listeners for editor
    // document.addEventListener('keydown', (event) => {
    //   Editor.onKeyPress(event);
    // });

    // // Put in key listeners for editor
    // document.addEventListener('keyup', (event) => {
    //   Editor.onKeyUp(event);
    // });

    // Update display on update
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.type) {
        case "update":
          Editor.onUpdate(message.tree);
          break;
        case "codeActions":
          Editor.setCodeActionCache(message.body.actionNames);
          break;
      }
    });

    // Load everything now
    Editor.requestUpdate();
  }, []);

  let treeBlock = <p> Loading... </p>;
  if (tokens != null) {
    // treeBlock = Token.tokenToReact(tokens);
    treeBlock = <TokenFlow tree={tokens} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {treeBlock}

      <p> This works at least </p>
      {JSON.stringify(tokens)}
    </DndProvider>
  );
}
