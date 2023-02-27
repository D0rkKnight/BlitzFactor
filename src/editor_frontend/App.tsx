
import * as React from "react";
import TokenFlow from './tokenFlow';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


import Editor from './editor';

export default function App() {
  const [tokens, setTokens] = React.useState([] as string[]);

  React.useEffect(() => {
    Editor.tokenChangeCB.push((newTokens: string[]) => {
      var cloned = newTokens.slice();
      setTokens(cloned);
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <TokenFlow tokens={tokens} />
    </DndProvider>
  );
}
