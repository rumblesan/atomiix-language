import { ParserException, Parser } from 'canto34';

import lexer from './lexer';
import translations from '../../translations';

import * as ast from '../ast';

import { scoreParser, scoreModifierParser } from './scoreParser';

const parser = new Parser();

// Subtract 1 because canto34 starts at line 1
function idToAgent(identifier) {
  return ast.Agent(
    identifier.content,
    identifier.line - 1,
    identifier.character - 1
  );
}

parser.setLanguage = function(language) {
  this.translation = (translations[language] || translations.english).parser;
};

parser.parse = function(program) {
  if (!this.translation) {
    this.setLanguage('english');
  }
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
  const identifier = this.match('identifier');

  if (!this.eof() && this.la1('play arrow')) {
    this.match('play arrow');
    const score = this.score();
    return ast.Play(idToAgent(identifier), score);
  } else if (!this.eof() && this.la1('double right arrow')) {
    return this.addEffectsChain(idToAgent(identifier));
  } else if (!this.eof() && this.la1('double left arrow')) {
    return this.removeEffectsChain(idToAgent(identifier));
  } else if (!this.eof() && this.la1('increase amplitude')) {
    this.match('increase amplitude');
    return ast.IncreaseAmplitude(idToAgent(identifier));
  } else if (!this.eof() && this.la1('decrease amplitude')) {
    this.match('decrease amplitude');
    return ast.DecreaseAmplitude(idToAgent(identifier));
  }

  // must be a command
  switch (identifier.content) {
    case this.translation.commands.group:
      return this.group(identifier);
    case this.translation.commands.future:
      return this.future(identifier);
    case this.translation.commands.sequence:
      throw new ParserException(this.translation.errors.sequenceUnsupported);
    default:
      return this.command(identifier);
  }
};

parser.score = function() {
  let instrument = '';
  if (this.la1('identifier')) {
    instrument = this.match('identifier').content;
  }
  const score = this.match('score');

  const modifiers = this.scoreModifiers();

  return scoreParser(this.translation, instrument, score, modifiers);
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
        this.translation,
        this.match('score modifier').content
      );
      modifiers.push(modifier);
    } else if (this.la1('open paren')) {
      const modifier = this.sustainModifier();
      modifiers.push(modifier);
    } else {
      throw new ParserException(this.translation.errors.expectingOpOrModifier);
    }
  }
  return modifiers;
};

parser.sustainModifier = function() {
  let multiplier = null;
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
  while (!this.eof() && this.la1('double right arrow')) {
    this.match('double right arrow');
    const effectName = this.match('identifier').content;
    effects.push(ast.Effect(effectName));
  }
  return ast.AddFXChain(agent, effects);
};

parser.removeEffectsChain = function(agent) {
  let effects = [];
  while (!this.eof() && this.la1('double left arrow')) {
    this.match('double left arrow');
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

parser.future = function(future) {
  let timing;
  let command;
  if (this.la1('number')) {
    const num = this.match('number').content;
    let mod;
    if (!this.eof() && this.la1('colon')) {
      this.match('colon');
      mod = this.match('number').content;
    }
    timing = ast.Num(num, mod);
  } else if (this.la1('beat')) {
    const beat = this.match('beat').content;
    let mod;
    if (!this.eof() && this.la1('colon')) {
      this.match('colon');
      mod = this.match('number').content;
    }
    timing = ast.Beat(beat, mod);
  }
  this.match('double right arrow');

  if (this.la1('increase amplitude')) {
    this.match('increase amplitude');
    const identifier = this.match('identifier');
    command = ast.IncreaseAmplitude(idToAgent(identifier));
  } else if (this.la1('decrease amplitude')) {
    this.match('decrease amplitude');
    const identifier = this.match('identifier');
    command = ast.DecreaseAmplitude(idToAgent(identifier));
  } else if (this.la1('identifier')) {
    const identifier = this.match('identifier');
    command = this.command(identifier);
  }
  return ast.Future(timing, command, {
    line: future.line - 1,
    character: future.character - 1,
  });
};

parser.command = function(command) {
  let args = [];
  while (!(this.eof() || this.la1('newline'))) {
    if (this.la1('number')) {
      const num = this.match('number').content;
      let mod;
      if (!this.eof() && this.la1('colon')) {
        this.match('colon');
        mod = this.match('number').content;
      }
      args.push(ast.Num(num, mod));
    } else if (this.la1('beat')) {
      const beat = this.match('beat').content;
      let mod;
      if (!this.eof() && this.la1('colon')) {
        this.match('colon');
        mod = this.match('number').content;
      }
      args.push(ast.Beat(beat, mod));
    } else if (this.la1('identifier')) {
      const str = this.match('identifier').content;
      args.push(ast.Str(str));
    } else {
      throw new ParserException(
        this.translation.errors.expectingNumberOrString
      );
    }
  }
  // Subtract 1 because canto34 starts at line 1
  return ast.Command(
    command.content,
    args,
    command.line - 1,
    command.character - 1
  );
};

parser.group = function(/*command*/) {
  const groupName = this.match('identifier').content;
  this.match('play arrow');
  let agents = [];
  while (!(this.eof() || this.la1('newline'))) {
    if (this.la1('identifier')) {
      agents.push(this.match('identifier').content);
    } else {
      throw new ParserException(this.translation.errors.expectingAgentName);
    }
  }
  return ast.Group(groupName, agents);
};

export default parser;
