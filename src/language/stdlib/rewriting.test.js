import { expect, test } from 'vitest';
import parser from '../parser/index.js';

import { writeScoreModifiers } from './rewriting.js';

test('can recreate the score modifiers string correctly', () => {
  // this isn't a real program, but should be fine for the moment
  const modifiers = '*2<2134>+12(1~4)^5^';
  const program = `jimi -> guitar[1 2 3 4 ]${modifiers}`;
  const parsed = parser.parse(program);
  const modifierAST = parsed.ast.statements[0].score.modifiers;
  const rewritten = writeScoreModifiers(modifierAST);
  expect(rewritten).toEqual(modifiers);
});
