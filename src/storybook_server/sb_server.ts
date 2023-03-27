// import Tokenizer from '../tokenizer'
var http = require('http');

// let context = {
//     asAbsolutePath: function (path) {
//         return path;
//     }
// }

(async () => {
    let Parser = require('web-tree-sitter');

    await Parser.init();
})();

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});

    // let tree = Tokenizer.tokenize('let x = 5');
    // console.log(tree);

    res.end('Hello World\n');
}).listen(1337);

console.log('Server running at localhost:1337');