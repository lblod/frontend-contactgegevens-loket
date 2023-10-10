import { validateUrl } from '../validators/url';
import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export const primaryContactValidations = {
  telephone: [
    validateFormat({
      allowBlank: true,
      regex: /^\+?[0-9]{7,10}$/,
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
    regex: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    message: 'Geef een geldig e-mailadres in',
  }),
};

export const secondaryContactValidations = {
  telephone: validateFormat({
    allowBlank: true,
    regex: /^\+?[0-9]{7,10}$/,
    message: 'Ongeldig telefoonnummer formaat',
  }),
};
