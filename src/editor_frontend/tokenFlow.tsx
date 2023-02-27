import * as React from "react";
import Editor from "./editor";
import Token from "./token";

export default function TokenFlow({tokens, selectedLines}) {
    return (
    <div>
        <p> Token Flow Begins Here</p>
        <button onClick={Editor.addLine}> Click to Add line!</button>

        <div>
            {tokens.map((token, index) => {
                var selected = selectedLines.includes(index);

                console.log("Selected: " + selected)

                return <Token key={index} id={Editor.getTokenID()} line={index} color="blue" selected={selected}>{token}</Token> // Weird default value issue?
            })}
        </div>
    </div>
  );
}