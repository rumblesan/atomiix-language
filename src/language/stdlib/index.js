// collects everything so it can be exported
import { doze, wake, nap } from './control';
import { kill, scale, scalepush, tonic, tempo } from './global';
import {
  shake,
  reverse,
  shiftr,
  shiftl,
  up,
  down,
  yoyo,
  swap,
  order,
  invert,
  replace,
  remove,
  insert,
  expand,
  dave,
} from './score';
import { grid, remind } from './editor';
import { midi } from './midi';

export default {
  doze,
  wake,
  nap,
  kill,
  scale,
  scalepush,
  tonic,
  tempo,
  shake,
  reverse,
  shiftr,
  shiftl,
  up,
  down,
  yoyo,
  swap,
  order,
  invert,
  replace,
  insert,
  remove,
  expand,
  grid,
  midi,
  remind,
  dave,
};
