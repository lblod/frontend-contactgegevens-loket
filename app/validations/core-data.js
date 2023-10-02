import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

const REQUIRED_MESSAGE = 'Dit is een verplicht veld';

const kboValidations = {
  localId: [
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
    }),
    validateFormat({
      regex: /^[01][0-9]{3}\.[0-9]{3}\.[0-9]{3}$/,
      message:
        'KBO nummer moet formaat hebben ####.###.###. E.g. 01238.905.678.',
    }),
  ],
};

const ovoValidations = {
  localId: [
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
    }),
    validateFormat({
      regex: /^OVO[0-9]{6}$/,
      message: 'OVO nummer moet formaat hebben OVO######. E.g. 0V0123123.',
    }),
  ],
};

export { kboValidations, ovoValidations };
