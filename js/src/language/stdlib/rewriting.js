import * as astTypes from '../../ast/types';

export function writeScoreModifiers(modifiers) {
  return modifiers
    .map(m => {
      switch (m.type) {
        case astTypes.SCOREOPERATOR:
          return writeScoreOperator(m);
        case astTypes.SCOREMODIFIER:
          return writeScoreMod(m);
        default:
          return '';
      }
    })
    .join('');
}

function writeScoreOperator({ operator, value }) {
  return `${operator}${value}`;
}

function writeSustainMod({ noteLength, multiplier }) {
  if (multiplier === null) {
    return `(${noteLength})`;
  } else {
    return `(${noteLength}~${multiplier})`;
  }
}

function writeScoreMod(modifier) {
  switch (modifier.modifierType) {
    case astTypes.PANNING:
      return `<${modifier.values.join('')}>`;
    case astTypes.ATTACK:
      return `^${modifier.values.join('')}^`;
    case astTypes.SUSTAIN:
      return writeSustainMod(modifier);
    default:
      return '';
  }
}
