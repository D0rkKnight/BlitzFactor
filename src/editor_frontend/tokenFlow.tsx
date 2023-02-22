import * as React from "react";
import Editor from "./editor";
import FlowLine from "./lineElement";

export default function TokenFlow({children}) {

    const [tokens, setTokens] = React.useState(['Loading elements!']);

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
                return <FlowLine line={index}>{token}</FlowLine>
            })}
        </div>

        ${children}
    </div>
  );
}