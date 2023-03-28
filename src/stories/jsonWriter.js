import Tokenizer from "../tokenizer"

const Parser = require("tree-sitter")
const fs = require("fs")

const parser = new Parser()
parser.setLanguage(require("tree-sitter-javascript"))

// Iterate over src/stories/tree_jsons for txt files
const files = fs.readdirSync("src/stories/tree_jsons")
files.forEach(file => {
    if (file.includes(".txt")) {
        const source = fs.readFileSync(`src/stories/tree_jsons/${file}`, "utf8")
        const tree = parser.parse(source)

        let processed = Tokenizer.WASMtoTREE(tree.rootNode, 0)

        fs.writeFileSync(`src/stories/tree_jsons/${file.replace(".txt", ".json")}`, JSON.stringify(processed))
    }
})