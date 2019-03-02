import { ParserException, Parser } from 'canto34';

import lexer from './lexer';

import * as ast from '../ast';

import { scoreParser, scoreModifierParser } from './scoreParser';

const parser = new Parser();

parser.parse = function(program) {
  const tokens = lexer.tokenize(program);
  this.initialize(tokens);
  return this.program();
};

parser.program = function() {
  const statements = [];
  while (!this.eof()) {
    if (this.la1('newline')) {
      this.match('newline');
    } else {
      statements.push(this.statement());
    }
  }
  return ast.Program(statements);
};

parser.statement = function() {
  if (this.la1('tempo')) {
    throw new ParserException("Don't support tempo changes yet");
  }
  if (this.la1('tonic')) {
    throw new ParserException("Don't support tonic changes yet");
  }
  if (this.la1('scale')) {
    throw new ParserException("Don't support scale changes yet");
  }
  if (this.la1('grid')) {
    throw new ParserException("Don't support grid changes yet");
  }
  if (this.la1('group')) {
    throw new ParserException("Don't support grid changes yet");
  }

  const agentName = ast.Agent(this.match('identifier').content);

  if (this.la1('play arrow')) {
    this.match('play arrow');
    const score = this.score();
    return ast.Play(agentName, score);
  } else if (this.la1('add effect arrow')) {
    throw new ParserException("Don't support adding effects yet");
  } else if (this.la1('remove effect arrow')) {
    throw new ParserException("Don't support removing effects yet");
  }
};

parser.score = function() {
  let instrument = '';
  if (this.la1('identifier')) {
    instrument = this.match('identifier').content;
  }
  const scoreString = this.match('score').content;

  const modifiers = this.scoreModifiers();

  return scoreParser(instrument, scoreString, modifiers);
};

// TODO
// handle the following modifiers
// * note length
// * whatever the tilde does
parser.scoreModifiers = function() {
  const modifiers = [];
  while (!this.eof() && !this.la1('newline')) {
    if (this.la1('operator')) {
      const operator = this.scoreOperator();
      modifiers.push(operator);
    } else if (this.la1('score modifier')) {
      const modifier = scoreModifierParser(
        this.match('score modifier').content
      );
      modifiers.push(modifier);
    } else {
      throw new ParserException(
        'Unexpected token: Expecting operator or score modifier'
      );
    }
  }
  return modifiers;
};

parser.scoreOperator = function() {
  const operator = this.match('operator').content;
  const number = this.match('number').content;
  return ast.ScoreOperator(operator, number);
};

parser.scoreOperator = function() {
  const operator = this.match('operator').content;
  const number = this.match('number').content;
  return ast.ScoreOperator(operator, number);
};

export default parser;
