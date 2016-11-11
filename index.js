var fs = require('fs')
var Gherkin = require('gherkin')

exports.parse = function (fileName) {
  var parser = new Gherkin.Parser(new Gherkin.AstBuilder())
  var ast = parser.parse(fs.readFileSync(fileName, 'utf8'))
  return ast;
}
