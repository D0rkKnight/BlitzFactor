import { TokenType } from "./tokenTypes";

export default class Token {
    type: TokenType;
    rawType: string;
    start: number;
    end: number;
    text: string;
    children: Token[];

    constructor(type: TokenType, rawType: string, start: number, end: number, text: string, children: Token[]) {
        this.type = type;
        this.rawType = rawType;
        this.start = start;
        this.end = end;
        this.text = text;
        this.children = children;
    }

    public static clone(tok: Token): Token {
        return new Token(tok.type, tok.rawType, tok.start, tok.end, tok.text, tok.children);
    }
}