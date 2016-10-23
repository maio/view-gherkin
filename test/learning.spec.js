var expect = require('chai').expect
var Gherkin = require('gherkin')

function aFeature(content) {
  return "Feature: Some Feature\n\n"
    + (Array.isArray(content) ? content.join("\n") : content)
}

function aScenario(content) {
  return "Scenario: Some Scenario\n\n"
    + (Array.isArray(content) ? content.join("\n") : content)
}

var they = it;

describe('Gherkin' , function () {
  var parser

  beforeEach(function() {
    parser = new Gherkin.Parser(new Gherkin.AstBuilder())
  })

  describe('parsed Feature' , function () {
    it('contains name, description and a list of scenarios', function () {
      var ast = parser.parse("Feature: My Feature\n"
                             + "Some Description\n"
                             + "Scenario: Some Scenario\n"
                             + "Scenario: Other Scenario")

      expect(ast.feature).to.deep.contain({
        name: 'My Feature',
        description: 'Some Description'
      })
      expect(ast.feature.children.length).to.equal(2)
    })
  })

  describe('parsed Scenario' , function () {
    it('contains name', function () {
      var scenario = parser.parse(aFeature("Scenario: Scenario #1"))
          .feature.children[0]

      expect(scenario).to.deep.contain({name: 'Scenario #1'})
    })

    it('contains tags', function () {
      var scenario = parser.parse(aFeature([
        "@Important @Slow",
        aScenario(),
      ])).feature.children[0]

      expect(scenario.tags.length).to.equal(2)
      expect(scenario.tags[0]).to.deep.include({name: '@Important'})
      expect(scenario.tags[1]).to.deep.include({name: '@Slow'})
    })

    describe('steps' , function () {
      they('contain keyword & text', function () {
        var scenario = parser.parse(aFeature(
          aScenario([
            "  Given state",
            "  When action",
            "  Then outcome"
          ])
        )).feature.children[0]

        expect(scenario.steps.length).to.equal(3)

        expect(scenario.steps[0]).to.deep.contain({
          keyword: 'Given ', text: 'state'})
        expect(scenario.steps[1]).to.deep.contain({
          keyword: 'When ', text: 'action'})
        expect(scenario.steps[2]).to.include({
          keyword: 'Then ', text: 'outcome'})
      })
    })
  })
})
