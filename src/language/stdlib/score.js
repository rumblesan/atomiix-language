import * as astTypes from '../ast/types';
import { AtomiixRuntimeError } from '../errors';

import { modifyScoreString } from './rewriting';

import { expectArgs, expectString, optionalNum, optionalString } from './util';

export function shake(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function reverse(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .reverse()
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function shiftr(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);
  const shift = optionalNum(state, name, args[1], 1);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    if (oldScoreString.length < 4) {
      return oldScoreString;
    }
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1);
    const sameChars = chars.slice(0, -shift);
    const movedChars = chars.substr(chars.length - shift);
    const newScoreString = opener + movedChars + sameChars + closer;
    return newScoreString;
  });
}

export function shiftl(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);
  const shift = optionalNum(state, name, args[1], 1);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    if (oldScoreString.length < 4) {
      return oldScoreString;
    }
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1);
    const sameChars = chars.substr(0, shift);
    const movedChars = chars.slice(shift);
    const newScoreString = opener + movedChars + sameChars + closer;
    return newScoreString;
  });
}

export function up(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    if (score.scoreType != astTypes.PERCUSSIVE) {
      return score.scoreString;
    }
    return score.scoreString.toUpperCase();
  });
}

export function down(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    if (score.scoreType != astTypes.PERCUSSIVE) {
      return score.scoreString;
    }
    return score.scoreString.toLowerCase();
  });
}

const isUpper = /^[A-Z]/;
const isLower = /^[a-z]/;
export function yoyo(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .map(c => {
        if (isUpper.test(c)) {
          return c.toLowerCase();
        } else if (isLower.test(c)) {
          return c.toUpperCase();
        } else {
          return c;
        }
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function swap(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1).split('');
    const choices = chars
      .filter(c => c !== ' ')
      .sort(() => 0.5 - Math.random());
    const newChars = chars
      .map(c => {
        if (c === ' ') return c;
        return choices.pop();
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function order(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1).split('');
    const choices = chars
      .filter(c => c !== ' ')
      .sort()
      .reverse();
    const newChars = chars
      .map(c => {
        if (c === ' ') return c;
        return choices.pop();
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function dave(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1).split('');
    const choices = chars
      .filter(c => c !== ' ')
      .sort()
      .reverse();
    const newChars = chars
      .map(c => {
        if (c === ' ') return c;
        return choices.pop();
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function replace(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);
  const upOrDown = optionalString(state, name, args[1]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1).split('');
    let newChars;
    switch (score.scoreType) {
      case astTypes.PERCUSSIVE:
        if (upOrDown === state.translation.misc.upper) {
          newChars = chars
            .map(c => {
              if (c.charCodeAt(0) < 64 || c.charCodeAt(0) > 90) return c;
              return String.fromCharCode(Math.ceil(Math.random() * 26) + 64);
            })
            .join('');
        } else if (upOrDown === state.translation.misc.lower) {
          newChars = chars
            .map(c => {
              if (c.charCodeAt(0) < 90 || c.charCodeAt(0) > 116) return c;
              return String.fromCharCode(Math.ceil(Math.random() * 26) + 90);
            })
            .join('');
        } else {
          newChars = chars
            .map(c => {
              if (c === ' ') return c;
              return alpha[Math.ceil(Math.random() * 52)];
            })
            .join('');
        }
        break;
      case astTypes.MELODIC:
      // fallthrough
      case astTypes.CONCRETE:
        newChars = chars
          .map(c => {
            if (c === ' ') return c;
            return Math.ceil(Math.random() * 9);
          })
          .join('');
    }
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function insert(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1).split('');
    let newChars;
    switch (score.scoreType) {
      case astTypes.PERCUSSIVE:
        newChars = chars
          .map(c => {
            if (c === ' ' && Math.random() > 0.5) {
              return alpha[Math.ceil(Math.random() * 52)];
            }
            return c;
          })
          .join('');
        break;
      case astTypes.MELODIC:
      // fallthrough
      case astTypes.CONCRETE:
        newChars = chars
          .map(c => {
            if (c === ' ' && Math.random() > 0.5) {
              return Math.ceil(Math.random() * 9);
            }
            return c;
          })
          .join('');
    }
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function remove(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .map(c => {
        if (c !== ' ' && Math.random() > 0.5) {
          return ' ';
        }
        return c;
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function expand(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);
  const size = optionalNum(state, name, args[1], 1);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .map(c => {
        if (c === ' ') return c;
        return c + ' '.repeat(size);
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function invert(state, { name, args }) {
  expectArgs(state, name, args, 1);
  const agentName = expectString(state, name, args[0]);

  return modifyScoreString(state, agentName, score => {
    if (score.scoreType !== astTypes.MELODIC) {
      throw new AtomiixRuntimeError(
        state.translation.errors.expectedMelodic(score.scoreType)
      );
    }
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .map(c => {
        if (c === ' ') return c;
        let v = parseInt(c, 10);
        return `${Math.abs(v - 8)}`;
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}
