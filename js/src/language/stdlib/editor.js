import { ReplaceLine } from '../../actions/editor';
import { expectArgs, expectNum } from './util';

export function grid(state, { name, args, line }, lineOffset) {
  let msgs = [];
  expectArgs(name, args, 1);
  const gridSpacing = Math.floor(expectNum(name, args[0]));
  const repeats = Math.floor(70 / gridSpacing);
  const gridLine =
    '          |' + (' '.repeat(gridSpacing - 1) + '|').repeat(repeats);
  msgs.push(ReplaceLine(line + lineOffset, gridLine));
  return msgs;
}
