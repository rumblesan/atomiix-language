import { ParserException, Parser } from 'canto34';

import lexer from './lexer';

import * as ast from '../ast';

import { sequenceParser } from './patternParser';

const parser = new Parser();

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
    const pattern = this.pattern();
    return ast.Play(agentName, pattern);
  } else if (this.la1('add effect arrow')) {
    throw new ParserException("Don't support adding effects yet");
  } else if (this.la1('remove effect arrow')) {
    throw new ParserException("Don't support removing effects yet");
  }
};

parser.pattern = function() {
  let instrument = '';
  if (this.la1('identifier')) {
    instrument = this.match('identifier').content;
  }
  const seqString = this.match('sequence').content;
  const sequence = sequenceParser(instrument, seqString);

  const effects = this.patternEffects();

  return ast.Pattern(sequence, effects);
};

parser.patternEffects = function() {
  return [];
};

parser.parse = function(program) {
  const tokens = lexer.tokenize(program);
  this.initialize(tokens);
  return this.program();
};

export default parser;
