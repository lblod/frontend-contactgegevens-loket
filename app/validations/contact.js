import { validateUrl } from '../validators/url';
import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export const primaryContactValidations = {
  telephone: [
    validateFormat({
      allowBlank: true,
      regex:
        /^(((\+|00)32[ ]?(?:\(0\)[ ]?)?)|0){1}(4(60|[789]\d)\/?(\s?\d{2}\.?){2}(\s?\d{2})|(\d\/?\s?\d{3}|\d{2}\/?\s?\d{2})(\.?\s?\d{2}){2})$/,
      message: 'Ongeldig telefoonnummer formaat',
    }),
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul een telefoonnummer in',
    }),
  ],
  website: validateUrl(),
  email: validateFormat({
    allowBlank: true,
    type: 'email',
    message: 'Geef een geldig e-mailadres in',
  }),
};

export const secondaryContactValidations = {
  telephone: validateFormat({
    allowBlank: true,
    regex:
      /^(((\+|00)32[ ]?(?:\(0\)[ ]?)?)|0){1}(4(60|[789]\d)\/?(\s?\d{2}\.?){2}(\s?\d{2})|(\d\/?\s?\d{3}|\d{2}\/?\s?\d{2})(\.?\s?\d{2}){2})$/,
    message: 'Ongeldig telefoonnummer formaat',
  }),
};
