
import * as React from "react";
import TokenFlow from './tokenFlow';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Editor from './editor';
import TokenBlock from "./tokenBlock";

export default function App() {
  const [tokens, setTokens] = React.useState({});
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [selectedLines, setSelectedLines] = React.useState([] as number[]);

  React.useEffect(() => {
    Editor.tokenChangeCB.push((newTokens: any) => {
      // var cloned = newTokens.slice();

      // TODO: Perform a deep copy
      var cloned = newTokens;
      setTokens(cloned);
      setDataLoaded(true);
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
    window.addEventListener('message', event => {
      const message = event.data; // The JSON data our extension sent

      switch (message.type) {
          case 'update':
              Editor.onUpdate(message.tree);
              break;
      }
    });

    // Load everything now
    Editor.requestUpdate();

  }, []);

  let treeBlock = <p> Loading... </p>;
  if (dataLoaded) {
    treeBlock = <TokenBlock id={Editor.getTokenID()} tree={tokens} line />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {treeBlock}

      <p> This works at least </p>
      {JSON.stringify(tokens)}
    </DndProvider>
  );
}
