import parser from './language/parser';

import { createState, interpret, freeAgents } from './language/interpreter';

const language = 'atomiix';

export default {
  language,
  parser,
  interpreter: {
    createState,
    interpret,
    freeAgents,
  },
};
