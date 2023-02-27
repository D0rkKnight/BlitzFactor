import * as React from "react";
import Editor from "./editor";
import FlowLine from "./lineElement";

export default function TokenFlow({children, initTokens = []}) {

    const [tokens, setTokens] = React.useState(initTokens as string[]);

    React.useEffect(() => {

    }, [tokens]);

    function addLine() {
        var newTokens = [...tokens, 'New Line'];

        setTokens(newTokens);
        
        // Tokens is input here
        Editor.writeText(newTokens.join('\r'));
    }

    function onUpdate(tokens: string[]) {
        setTokens(tokens)
    }

    Editor.tokenChangeCB.push(onUpdate);

    return (
    <div>
        <p> Token Flow Begins Here</p>
        <button onClick={addLine}> Click to Add line!</button>

        <div>
            {tokens.map((token, index) => {
                return <FlowLine key={index} line={index} color="blue">{token}</FlowLine> // Weird default value issue?
            })}
        </div>

        ${children}
    </div>
  );
}