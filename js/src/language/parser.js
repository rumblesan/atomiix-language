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
  const identifier = this.match('identifier').content;

  if (this.la1('play arrow')) {
    this.match('play arrow');
    const score = this.score();
    return ast.Play(ast.Agent(identifier), score);
  } else if (this.la1('add effect arrow')) {
    return this.addEffectsChain(ast.Agent(identifier));
  } else if (this.la1('remove effect arrow')) {
    return this.removeEffectsChain(ast.Agent(identifier));
  } else if (this.la1('increase amplitude')) {
    this.match('increase amplitude');
    return ast.IncreaseAmplitude(ast.Agent(identifier));
  } else if (this.la1('decrease amplitude')) {
    this.match('decrease amplitude');
    return ast.DecreaseAmplitude(ast.Agent(identifier));
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
    } else if (this.la1('open paren')) {
      const modifier = this.sustainModifier();
      modifiers.push(modifier);
    } else {
      throw new ParserException(
        'Unexpected token: Expecting operator or score modifier'
      );
    }
  }
  return modifiers;
};

parser.sustainModifier = function() {
  let multiplier = 1;
  this.match('open paren');
  const noteLength = this.match('number').content;
  if (this.la1('sustain multiplier')) {
    this.match('sustain multiplier');
    multiplier = this.match('number').content;
  }
  this.match('close paren');
  return ast.ScoreSustainModifier(noteLength, multiplier);
};

parser.scoreOperator = function() {
  const operator = this.match('operator').content;
  const number = this.match('number').content;
  return ast.ScoreOperator(operator, number);
};

parser.addEffectsChain = function(agent) {
  let effects = [];
  while (!this.eof() && this.la1('add effect arrow')) {
    this.match('add effect arrow');
    const effectName = this.match('identifier').content;
    effects.push(ast.Effect(effectName));
  }
  return ast.AddFXChain(agent, effects);
};

parser.removeEffectsChain = function(agent) {
  let effects = [];
  while (!this.eof() && this.la1('remove effect arrow')) {
    this.match('remove effect arrow');
    if (this.eof() || !this.la1('identifier')) {
      if (effects.length === 0) {
        // if this is the first attempt at getting an effect name
        // and there isn't one, then we're removing all effects
        break;
      }
    }
    const effectName = this.match('identifier').content;
    effects.push(ast.Effect(effectName));
  }
  return ast.RemoveFXChain(agent, effects);
};

export default parser;