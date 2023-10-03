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
    // The input mask on the control lets the user type 0123.899.899 but will return the value 0123899899
    // This is why we check for the regex without dots!
    validateFormat({
      regex: /^[0-1][0-9]{9}$/,
      message:
        'KBO nummer moet formaat hebben ####.###.###. E.g. 0123.905.678. Het eerste getal mag enkel 0 of 1 zijn.',
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
