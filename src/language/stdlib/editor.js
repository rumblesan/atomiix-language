// things that specifically change something visually in the editor
import { ReplaceLine, DisplayInfo } from '../../actions/editor/index.js';
import { QueryInfo } from '../../actions/audio/index.js';
import { expectArgs, expectNum } from './util.js';
import stdlib from './index.js';

export function grid(state, { name, args, line }, lineOffset) {
  let msgs = [];
  expectArgs(state, name, args, 1);
  const gridSpacing = Math.floor(expectNum(state, name, args[0]));
  const repeats = Math.floor(70 / gridSpacing);
  const gridLine =
    '          |' + (' '.repeat(gridSpacing - 1) + '|').repeat(repeats);
  msgs.push(ReplaceLine(line + lineOffset, gridLine));
  return msgs;
}

export function remind() {
  const text = Object.keys(stdlib);
  return [DisplayInfo(text)];
}

export function instr() {
  return [QueryInfo('instruments')];
}

export function effects() {
  return [QueryInfo('effects')];
}
