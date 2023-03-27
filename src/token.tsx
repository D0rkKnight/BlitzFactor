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

    public findTextInChildren(text: string): Token | null {
        for (let child of this.children) {
            if (child.text === text)
                return child;
            
            let found = child.findTextInChildren(text);
            if (found !== null)
                return found;
        }
        return null;
    }

    public getAllTokens(): Token[] {
        let tokens = [this as Token];
        for (let child of this.children)
            tokens = tokens.concat(child.getAllTokens());
        return tokens;
    }
}