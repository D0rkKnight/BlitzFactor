import Token from "../token";
import Editor from "./editor";
import SyntaxTree from "./SyntaxTree";

/**
 * Provides certain services regarding highlighting items
 * Only holds state, will not call other code
 */
export default class Highlighter {
  static highlightedTokens: Token[] = [];

  static deepestToken: Token | null = null; // Deepest highlighted token
  static adjToken: Token | null = null; // Adjusted highlighted token (greatest parent token that is left adjusted with deepest token)

  // Also handle selection stuff for now
  static rightClickQueried: Token[] = [];

  static setHighlightInclusion(token: Token, include: boolean) {
    if (include && !this.highlightedTokens.includes(token)) {
      this.highlightedTokens.push(token);
    }
    if (!include) {
      this.highlightedTokens = this.highlightedTokens.filter(t => t !== token);
    }

    // Capture deepest highlighted token
    // Will grab an entire block of its indent bar
    Highlighter.deepestToken = Highlighter.getDeepestHighlighted();

    // Capture adjusted highlighted token
    Highlighter.adjToken = Highlighter.getAdjustedFromDeepest();

    // console.log("Deepest: ", Highlighter.deepestToken)
    // console.log("Adjusted: ", Highlighter.adjToken)
  }

  public static getAdjustedFromDeepest(deepest: Token | null = Highlighter.deepestToken, tree: SyntaxTree = Editor.syntaxTree!): Token | null {
    if (deepest !== null) {

      // Get the highest token that is left adjusted with the deepest highlighted token
      let adj = deepest;
      let parent: Token | undefined = undefined;

      while ((parent = tree.backlinks.get(adj!)) !== undefined) {

        if (parent.children[0].start[0] === adj!.start[0] &&
          parent.children[0].start[1] === adj!.start[1]) {
          adj = parent;
        } else {
          break;
        }
      }

      return adj;
    }

    return null;
  }

  public static getDeepestHighlighted(highlighted: Token[] = this.highlightedTokens): Token | null {
    if (highlighted.length > 0) {
      return highlighted.reduce((a, b) => {
        return a.depth > b.depth ? a : b;
      });
    }

    return null;
  }

  static isHighlighted(token: Token): boolean {

    return this.adjToken === token;

  }

  static setRightClickCacheFromHighlights() {
    this.rightClickQueried = [];

    if (this.deepestToken !== null) {
      this.rightClickQueried.push(this.deepestToken)
    }

    // Have editor update code actions menu
  }

}