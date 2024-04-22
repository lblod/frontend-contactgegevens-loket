import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';

const HELP_TEXT = {
  date: 'Formaat: DD/MM/JJJJ',
  ['phone-number']: 'Bijvoorbeeld: +3211211430',
  ssn: 'Formaat: 00.00.00-000.00',
  kbo: 'Formaat: 0123.456.789',
  url: 'Bijvoorbeeld: https://www.vlaanderen.be',
  email: 'Bijvoorbeeld: mail@adres.com',
  legalName:
    'De juridische naam is de naam uit de statuten, een decreet of andere juridisch regelgevende teksten of besluiten.',
  alternativeNames:
    ' De alternatieve naam kan de afgekorte naam uit statuten, een commerciële en/of een informele naam zijn.',
};

export default helper(function helpText([key]) {
  assert(
    `{{help-text}}: No help text value found for "${key}"`,
    Boolean(HELP_TEXT[key]),
  );
  return HELP_TEXT[key];
});
