console.log(document)

import HelloWorld from './export.js';

console.log(HelloWorld());

// import Json5 from 'json5';

import * as React from "react";
import { useEffect } from 'react';
import * as ReactDOM from 'react-dom';

export default function App() {
  useEffect(() => {
    // code to execute when the component is loaded
    console.log('Component loaded!');
  }, []);

  function handleClick() {
    // code to execute when the button is clicked
    console.log('Button clicked!');
  }

  return (
    <button onClick={handleClick}> Button!!! </button>
    // Build a React component from methods


  );
}

console.log('testReactComponent.tsx loaded!');
console.log(document.getElementById('app'));

// Add app to DOM
import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);