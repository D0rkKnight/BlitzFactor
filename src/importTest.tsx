import * as React from "react";
import * as ReactDOM from 'react-dom';

export default function Line({children, txt = 'This is a line!'}) {
  return (
    <div>
        {txt}
        {children}
    </div>
  );

}