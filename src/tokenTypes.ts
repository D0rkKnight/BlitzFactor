export enum TokenType {
    identifier,
    function_declaration,
    formal_parameters,
    statement_block,
    punctuation,
    program,
    operator,
    string,
    number,
    comment,
    keyword,


    other
}

export const WASMTypeToTokenType = (type: string): TokenType => {
    switch (type) {
        case "identifier":
            return TokenType.identifier;
        case "function_declaration":
            return TokenType.function_declaration;
        case "formal_parameters":
            return TokenType.formal_parameters;
        case "statement_block":
            return TokenType.statement_block;
        case "program":
            return TokenType.program;
        case "+":
        case "-":
        case "*":
        case "/":
        case "=":
        case "==":
        case "!=":
        case ">":
        case "<":
        case ">=":
        case "<=":
        case "&&":
        case "||":
        case "!":
        case "++":
        case "--":
        case "+=":
        case "-=":
        case "*=":
        case "/=":
        case "%=":
        case "&=":
        case "|=":
        case "^=":
        case "<<=":
        case ">>=":
            return TokenType.operator;
        case "string":
            return TokenType.string;
        case "number":
            return TokenType.number;
        case "comment":
            return TokenType.comment;


        // General family of keywords
        case "const":
        case "let":
        case "var":
        case "if":
        case "else":
        case "for":
        case "while":
        case "do":
        case "break":
        case "continue":
        case "return":
        case "switch":
        case "case":
        case "default":
        case "try":
        case "catch":
        case "finally":
        case "throw":
        case "class":
        case "extends":
        case "constructor":
        case "super":
        case "this":
        case "function":
        case "new":
        case "delete":
        case "typeof":
        case "void":
        case "in":
            return TokenType.keyword;

        // Punctuation (that should be sheared off)
        case "(":
        case ")":
        case "{":
        case "}":
        case ";":
        case ",":
        case ".":
        case "[":
        case "]":
            return TokenType.punctuation;
        default:
            return TokenType.other;
    }
}