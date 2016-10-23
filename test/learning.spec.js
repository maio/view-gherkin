var expect = require('chai').expect
var Gherkin = require('gherkin')

function indent(s) {
  var lines = (s || "").split("\n")

  return lines.map(function(line) {
    return "  " + line;
  }).join("\n")
}

function aFeature(content) {
  return "Feature: Some Feature\n\n" + indent((content || []).join("\n"))
}

function aScenario(content) {
  return "Scenario: Some Scenario\n" + indent((content || []).join("\n"))
}

function aBackground(content) {
  return "Background:\n" + indent((content || []).join("\n"))
}

var they = it;

describe('Gherkin', function () {
  var parser

  beforeEach(function() {
    parser = new Gherkin.Parser(new Gherkin.AstBuilder())
  })

  describe('parsed Feature' , function () {
    it('contains name, description and children', function () {
      var ast = parser.parse("Feature: My Feature\n"
                             + "  Some Description\n\n"
                             + "  Background:\n"
                             + "    Given background state\n"
                             + "  Scenario: Some Scenario\n"
                             + "  Scenario: Other Scenario")

      expect(ast.feature).to.deep.contain({
        name: 'My Feature',
        description: '  Some Description'
      })

      // background + scenarios
      expect(ast.feature.children.length).to.equal(3)
    })
  })

  describe('parsed Background' , function () {
    it('contains steps', function () {
      var background = parser.parse(aFeature([
        aBackground(["Given state", "And other state"])
      ])).feature.children[0]

      expect(background.steps.length).to.equal(2)

      expect(background.steps[0]).to.deep.contain({
        keyword: 'Given ', text: 'state'})
      expect(background.steps[1]).to.deep.contain({
        keyword: 'And ', text: 'other state'})
    })
  })

  describe('parsed Scenario' , function () {
    it('contains name', function () {
      var scenario = parser.parse(aFeature(["Scenario: Scenario #1"]))
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
        var scenario = parser.parse(aFeature([
          aScenario([
            "Given state",
            "When action",
            "Then outcome"
          ])
        ])).feature.children[0]

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

describe('Feature builder', function () {
  it('returns feature as a string', function () {
    var feature = aFeature([
      aBackground(["Given background state"]),
      aScenario([
        "Given state",
        "When action",
        "Then outcome"
      ]),
    ])

    expect(feature.split("\n")).to.deep.equal([
      "Feature: Some Feature",
      "",
      "  Background:",
      "    Given background state",
      "  Scenario: Some Scenario",
      "    Given state",
      "    When action",
      "    Then outcome",
    ])
  })
})
