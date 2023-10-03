import { validateFormat } from 'ember-changeset-validations/validators';
import { validateUrl } from '../validators/url';

export const primaryContactValidations = {
  telephone: validateFormat({
    allowBlank: true,
    regex: /^\+?[0-9]*$/,
    message: 'Enkel een plusteken en cijfers zijn toegelaten',
  }),
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
