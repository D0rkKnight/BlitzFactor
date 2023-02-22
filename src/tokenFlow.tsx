import * as React from "react";
import Editor from "./editor";

export default function TokenFlow({children}) {

    const [tokens, setTokens] = React.useState(['Line 1', 'Line 2']);

    React.useEffect(() => {

    }, [tokens]);

    function addLine() {
        setTokens([...tokens, 'New Line']);
        
        // Tokens is input here
        Editor.writeText(tokens.join('\r'));
    }

    function onUpdate(tokens: string[]) {
        setTokens(tokens)
    }

    Editor.tokenChangeCB.push(onUpdate);

    return (
    <div>
        <p> Token Flow Begins Here</p>
        <button onClick={addLine}> Click to Add line!</button>

        <ul>
            {tokens.map((token, index) => {
                return <li key={index}>{token}</li>
            })}
        </ul>

        ${children}
    </div>
  );
}