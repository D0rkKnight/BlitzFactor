
import * as React from "react";
import { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import TokenFlow from './tokenFlow';

import Editor from './editor';

export default function App() {
    return (
      <div>
          <TokenFlow> </TokenFlow>
      </div>
    );
  }
  