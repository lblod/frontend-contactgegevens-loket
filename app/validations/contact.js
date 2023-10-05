import { validateUrl } from '../validators/url';
import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export const primaryContactValidations = {
  telephone: [
    validateFormat({
      allowBlank: true,
      regex: /^\+?[0-9]*$/,
      message: 'Enkel een plusteken en cijfers zijn toegelaten',
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
    regex: /^\+?[0-9]*$/,
    message: 'Enkel een plusteken en cijfers zijn toegelaten',
  }),
};
