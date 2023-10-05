import { validateFormat } from 'ember-changeset-validations/validators';

export function validateUrl() {
  return validateFormat({
    allowBlank: true,
    regex: /^((?:https?:\/\/)[^.]+(?:\.[^.]+)+(?:\/.*)?)$/,
    message: 'Geef een geldig internetadres in',
  });
}

const theDefaultExport = {
  lol: 'Derp',
};

export default theDefaultExport;
