import { TokenType } from "./tokenTypes";
import TokenBlock from "./editor_frontend/tokenBlock";
import Editor from "./editor_frontend/editor";
import React from "react";

export default class Token {
    type: TokenType;
    rawType: string;
    start: [number, number];
    end: [number, number];
    text: string;
    children: Token[];
    depth: number; // # of layers in tree

    constructor(type: TokenType, rawType: string, start: [number, number], end: [number, number], text: string, children: Token[], depth: number) {
        this.type = type;
        this.rawType = rawType;
        this.start = start;
        this.end = end;
        this.text = text;
        this.children = children;
        this.depth = depth;
    }

    public static clone(tok: Token): Token {
        return new Token(tok.type, tok.rawType, tok.start, tok.end, tok.text, tok.children, tok.depth);
    }

    public static tokenToReact(tok: Token, selected: boolean=false, hovered:boolean=false, key:number|undefined = undefined): JSX.Element {
        let id = Editor.syntaxTree?.getTokenID(tok);

        if (key === null)
            key = id;

        return <TokenBlock key={key} id={id} 
        line={id} selected={selected} hovered={hovered} tree={tok} />;
    }
}