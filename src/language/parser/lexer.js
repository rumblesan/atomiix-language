import { Lexer, StandardTokenTypes } from '@rumblesan/virgil';

const types = StandardTokenTypes;

const lexer = new Lexer();

const comment = () => ({
  name: 'comment',
  ignore: true,
  regexp: /^\/\/[^\n]*/,
});

const newline = () => ({
  name: 'newline',
  regexp: /^\n[ \n]*/,
});

const identifier = () => ({
  name: 'identifier',
  regexp: /^[a-zA-Z][a-zA-Z0-9]*/,
});

const score = () => ({
  name: 'score',
  regexp: /^[{[\\|][a-zA-Z0-9 ]*[}\]\\|]/,
});

const scoreModifier = () => ({
  name: 'score modifier',
  regexp: /^[<\\^][0-9]*[>\\^]/,
});

const operator = () => ({
  name: 'operator',
  regexp: /^[*/+\-!@]+/,
});

const sustainMultiplier = () => ({
  name: 'sustain multiplier',
  regexp: /^[_~]/,
});

const beat = () => ({
  name: 'beat',
  regexp: /^\d+(\.\d+)?b/,
  role: ['constant', 'numeric'],
  interpret(content) {
    // hacky but works, because parse float ignores the trailing 'b'
    return parseFloat(content);
  },
});

const number = () => ({
  name: 'number',
  regexp: /^\d+(\.\d+)?/,
  role: ['constant', 'numeric'],
  interpret(content) {
    return parseFloat(content);
  },
});

lexer.addTokenType(types.whitespace());
lexer.addTokenType(newline());
lexer.addTokenType(comment());

lexer.addTokenType(types.constant('->', 'play arrow'));
lexer.addTokenType(types.constant('>>', 'double right arrow'));
lexer.addTokenType(types.constant('<<', 'double left arrow'));
lexer.addTokenType(types.constant('))', 'increase amplitude'));
lexer.addTokenType(types.constant('((', 'decrease amplitude'));
lexer.addTokenType(types.constant(':', 'colon'));

lexer.addTokenType(sustainMultiplier());

lexer.addTokenType(types.openParen());
lexer.addTokenType(types.closeParen());

lexer.addTokenType(operator());

lexer.addTokenType(beat());
lexer.addTokenType(number());

lexer.addTokenType(identifier());
lexer.addTokenType(score());
lexer.addTokenType(scoreModifier());

export default lexer;
