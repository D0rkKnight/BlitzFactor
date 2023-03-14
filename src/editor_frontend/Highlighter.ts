import Token from "../token";
import Editor from "./editor";

export default class Highlighter {
  static highlightedTokens: Token[] = [];
  static deepestToken: Token | null = null; // Deepest highlighted token
  static adjToken: Token | null = null; // Adjusted highlighted token

  static setHighlightInclusion(token: Token, include: boolean) {
    if (include && !this.highlightedTokens.includes(token)) {
      this.highlightedTokens.push(token);
    }
    if (!include) {
      this.highlightedTokens = this.highlightedTokens.filter(t => t !== token);
    }

    // Capture deepest highlighted token
    // Will grab an entire block of its indent bar
    if (this.highlightedTokens.length > 0) {
        this.deepestToken = this.highlightedTokens.reduce((a, b) => {
            return a.depth > b.depth ? a : b;
        });
    }

    // Capture adjusted highlighted token
    if (this.highlightedTokens.length > 0 && this.deepestToken !== null) {

        // Get the highest token that is left adjusted with the deepest highlighted token
        this.adjToken = this.deepestToken;
        let parent: Token | undefined = undefined;

        while ((parent = Editor.syntaxTree?.backlinks.get(this.adjToken!)) !== undefined) {

            if (parent.children[0].start[0] === this.adjToken!.start[0] &&
                parent.children[0].start[1] === this.adjToken!.start[1]) {
                this.adjToken = parent;
            } else {
                break;
            }
        }
    }

    // Redraw the tree with different highlight values
    Editor.redraw();
  }

  static isHighlighted(token: Token): boolean {

    return this.adjToken === token;

  }

}