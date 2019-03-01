import parser from 'language/parser';
import { programToOSC } from 'transport/osc';

const language = 'atomiix';

export default {
  language,
  parser,
  transport: {
    toOSC: programToOSC,
  },
};
