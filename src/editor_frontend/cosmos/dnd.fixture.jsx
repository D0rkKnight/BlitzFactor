import React from "react";
import App from "../App";
import Token from "../token";
import TokenFlow from "../tokenFlow";
import './../style.css'

export default {
    Line: (
        <span>
            <TokenFlow initTokens={["Line 1", "Line 2"]} />
        </span>
    )
}