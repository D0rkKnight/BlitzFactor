
import * as React from "react";
import TokenFlow from './tokenFlow';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Editor from './editor';

export default function App() {
  const [tokens, setTokens] = React.useState([] as string[]);
  const [selectedLines, setSelectedLines] = React.useState([] as number[]);

  React.useEffect(() => {
    Editor.tokenChangeCB.push((newTokens: string[]) => {
      var cloned = newTokens.slice();
      setTokens(cloned);
    });
    Editor.lineSelectChangeCB.push((newSelectedLines: number[]) => {
      var cloned = newSelectedLines.slice();
      setSelectedLines(cloned);
    })

    // Put in key listeners for editor
    document.addEventListener('keydown', (event) => {
      Editor.onKeyPress(event);
    });

    // Put in key listeners for editor
    document.addEventListener('keyup', (event) => {
      Editor.onKeyUp(event);
    });

    // Update display on update
    window.addEventListener('message', event => {
      const message = event.data; // The JSON data our extension sent

      switch (message.type) {
          case 'update':
              Editor.onUpdate(message.text);
              break;
      }
    });

    // Load everything now
    Editor.requestUpdate();

  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <TokenFlow tokens={tokens} selectedLines={selectedLines}/>
    </DndProvider>
  );
}
