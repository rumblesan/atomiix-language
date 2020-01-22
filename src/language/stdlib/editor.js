// things that specifically change something visually in the editor
import { ReplaceLine, DisplayInfo } from '../../actions/editor';
import { QueryInfo } from '../../actions/audio';
import { expectArgs, expectNum } from './util';
import stdlib from './index';

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
