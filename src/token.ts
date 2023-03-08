export default class Token {
    type: string;
    rawType: string;
    start: number;
    end: number;
    text: string;
    children: Token[];

    constructor(type: string, rawType: string, start: number, end: number, text: string, children: Token[]) {
        this.type = type;
        this.rawType = rawType;
        this.start = start;
        this.end = end;
        this.text = text;
        this.children = children;
    }
}