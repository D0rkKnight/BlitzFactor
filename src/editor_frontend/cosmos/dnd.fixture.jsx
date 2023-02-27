import React from "react";
import App from "../App";
import FlowLine from "../lineElement";
import TokenFlow from "../tokenFlow";
import './../style.css'

export default {
    Line: (
        <span>
            <TokenFlow initTokens={["Line 1", "Line 2"]} />
        </span>
    )
}