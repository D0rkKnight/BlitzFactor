console.log(document)

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
  );
}

console.log('testReactComponent.tsx loaded!');
console.log(document.getElementById('app'));

// Add app to DOM
// ReactDOM.render(<App />, document.getElementById('app'));
