import parser from './language/parser';

import { createState, interpret } from './language/interpreter';

const language = 'atomiix';

export default {
  language,
  parser,
  interpreter: {
    createState,
    interpret,
  },
};
