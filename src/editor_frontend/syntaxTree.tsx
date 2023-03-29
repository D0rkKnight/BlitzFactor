// Handles the data of the syntax tree
import Token from "../token";

// All edits NEED to pass through here!
export default class SyntaxTree {
    root: Token;
    idTokenMap = new Map<Token, number>();
    backlinks = new Map<Token, Token>();

    constructor(root: Token) {
        this.root = root;

        this.generateIdTokenMap();

        // Fill out parent backlinks
        this.fillParentBacklinks(this.root);
    }

    // Generate id token map recursively
    generateIdTokenMap() {
        this.idTokenMap.clear();
        this.idCounter = 0;

        this.recurseIdTokenMap(this.root, this.idTokenMap);
    }

    recurseIdTokenMap(token: Token, map: Map<Token, number>) {
        map.set(token, this.getNextID());
        token.children.forEach(child => this.recurseIdTokenMap(child, map));
    }

    idCounter: number = 0;
    getNextID() {
        return this.idCounter++;
    }

    getTokenID(token: Token): number {
        return this.idTokenMap.get(token) as number;
    }

    fillParentBacklinks(token: Token) {
        token.children.forEach(child => {
            this.backlinks.set(child, token);
            this.fillParentBacklinks(child);
        });
    }
}