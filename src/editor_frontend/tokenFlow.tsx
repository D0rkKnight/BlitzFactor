import * as React from "react";
import Editor from "./editor";
import Token from "./token";

export default function TokenFlow({tokens}) {
    return (
    <div>
        <p> Token Flow Begins Here</p>
        <button onClick={Editor.addLine}> Click to Add line!</button>

        <div>
            {tokens.map((token, index) => {
                return <Token key={index} id={Editor.getTokenID()} line={index} color="blue">{token}</Token> // Weird default value issue?
            })}
        </div>
    </div>
  );
}