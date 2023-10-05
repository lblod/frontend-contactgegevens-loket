import { validatePresence } from 'ember-changeset-validations/validators';
import validateNested from 'frontend-contactgegevens-loket/validators/nested';

export default {
  siteType: validateNested(
    'label',
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Voeg een type vestiging toe',
    }),
  ),
};
