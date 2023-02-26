
import * as React from "react";
import TokenFlow from './tokenFlow';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


import Editor from './editor';

export default function App() {
    return (
      <DndProvider backend={HTML5Backend}>

        <div>
            <TokenFlow> </TokenFlow>
        </div>
      </DndProvider>
    );
  }
  