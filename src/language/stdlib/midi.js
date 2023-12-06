// agent control commands - sleeping, waking, dozing etc
import { MIDIAction } from '../../actions/audio';

import { AtomiixRuntimeError } from '../errors';

import { expectArgs, expectString, expectNum } from './util';

export function midi(state, { name, args }) {
  const midiCommand = expectString(state, name, args[0]);
  const msgs = [];

  switch (midiCommand) {
    case 'list':
      expectArgs(state, name, args, 1);
      msgs.push(MIDIAction('list', []));
      break;
    case 'open':
      expectArgs(state, name, args, 2);
      msgs.push(MIDIAction('open', [expectNum(state, name, args[1])]));
      break;
    default:
      throw new AtomiixRuntimeError(
        state.translation.errors.invalidMIDICommand(midiCommand)
      );
  }

  return msgs;
}
