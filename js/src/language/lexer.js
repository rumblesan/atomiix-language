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
  regexp: /^[a-zA-Z][a-zA-Z0-9]*/,
});

const sequence = () => ({
  name: 'sequence',
  regexp: /^[{[\\|][a-zA-Z0-9 ]*[}\]\\|]/,
});

const sequenceEffect = () => ({
  name: 'peffect',
  regexp: /^"[<^][Z0-9 ]*[>^]"/,
});

const operator = () => ({
  name: 'operator',
  regexp: /^[*/+-]+/,
});

lexer.addTokenType(types.whitespace());
lexer.addTokenType(newline());
lexer.addTokenType(comment());

lexer.addTokenType(types.constant('->', 'play arrow'));
lexer.addTokenType(types.constant('>>', 'add effect arrow'));
lexer.addTokenType(types.constant('<<', 'remove effect arrow'));

lexer.addTokenType(types.openParen());
lexer.addTokenType(types.closeParen());

lexer.addTokenType(operator());

lexer.addTokenType(types.floatingPoint());
lexer.addTokenType(types.integer());

lexer.addTokenType(identifier());
lexer.addTokenType(sequence());
lexer.addTokenType(sequenceEffect());

export default lexer;
