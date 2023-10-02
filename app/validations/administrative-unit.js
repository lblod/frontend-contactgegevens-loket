import { validatePresence } from 'ember-changeset-validations/validators';
import validateNested from '../validators/nested';
// import { ID_NAME } from '../models/identifier';

export default {
  name: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Vul de naam in',
  }),

  classification: validateNested(
    'label',
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
  ),

  organizationStatus: validateNested(
    'label',
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Selecteer een optie',
    }),
  ),
};
