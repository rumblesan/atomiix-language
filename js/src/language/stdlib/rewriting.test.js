import parser from '../parser';

import { writeScoreModifiers } from './rewriting';

test('can recreate the score modifiers string correctly', () => {
  // this isn't a real program, but should be fine for the moment
  const modifiers = '*2<2134>+12(1~4)^5^';
  const program = `jimi -> guitar[1 2 3 4 ]${modifiers}`;
  const { statements } = parser.parse(program);
  const modifierAST = statements[0].score.modifiers;
  const rewritten = writeScoreModifiers(modifierAST);
  expect(rewritten).toEqual(modifiers);
});
