import * as canto34 from 'canto34';

const types = canto34.StandardTokenTypes;

const lexer = new canto34.Lexer({ languageName: 'atomiix' });

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
  regexp: /^[<>a-zA-Z][a-zA-Z0-9]*/,
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
lexer.addTokenType(types.constant('>>', 'add effect arrow'));
lexer.addTokenType(types.constant('<<', 'remove effect arrow'));
lexer.addTokenType(types.constant('))', 'increase amplitude'));
lexer.addTokenType(types.constant('((', 'decrease amplitude'));

lexer.addTokenType(sustainMultiplier());

lexer.addTokenType(types.openParen());
lexer.addTokenType(types.closeParen());

lexer.addTokenType(operator());

lexer.addTokenType(number());

lexer.addTokenType(identifier());
lexer.addTokenType(score());
lexer.addTokenType(scoreModifier());

export default lexer;
