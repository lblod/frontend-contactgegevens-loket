import Joi from 'joi';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';
import { SITE_CODE } from '../models/site';
const belgiumPhoneNumberRegex = /^(tel:)?(\+32|04|0032)[1-9](?:\s?[0-9]){7,8}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const websiteRegex = /^https:\/\//;
const phoneNumberRegex = /^(tel:)?\+?[0-9\s()-]*$/;

export const allowedSiteMatrix = {
  [CLASSIFICATION_CODE.MUNICIPALITY]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
    [SITE_CODE.GEMEENTEHUIS]: 1,
  },
  [CLASSIFICATION_CODE.OCMW]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.DISTRICT]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
    [SITE_CODE.DISTRICTHUIS]: 1,
  },
  [CLASSIFICATION_CODE.PROVINCE]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
    [SITE_CODE.PROVINCIEHUIS]: 1,
  },
  [CLASSIFICATION_CODE.AGB]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.APB]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.PROJECTVERENIGING]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.POLICE_ZONE]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
    [SITE_CODE.HOOFDCOMMISARIAAT]: 1,
  },
  [CLASSIFICATION_CODE.ASSISTANCE_ZONE]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.WORSHIP_SERVICE]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
  [CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE]: {
    [SITE_CODE.MAATSCHAPPELIJKE_ZETEL]: 1,
  },
};

export const errorValidation = Joi.object()
  .keys({
    siteType: Joi.string()
      .required()
      .messages({ '*': 'Gelieve een vestiginstype te kiezen' }),
    country: Joi.string()
      .required()
      .messages({ '*': 'Gelieve een land te kiezen' }),
    street: Joi.string()
      .required()
      .messages({ '*': 'Geef een geldige straat naam in' }),
    number: Joi.string()
      .required()
      .messages({ '*': 'Geef een geldige huisnummer in' }),
    postcode: Joi.string().required().messages({ '*': 'Geef een postcode in' }),
    municipality: Joi.string()
      .required()
      .messages({ '*': 'Geef een geldige gemeente in' }),
    province: Joi.string()
      // Using.when() to conditionally require the province field
      .when('$country', {
        // Referencing the 'country' field at the root level
        is: 'België', // Condition: if 'country' is 'België'
        then: Joi.required(), // Then make 'province' required
        otherwise: Joi.allow(null), // Optionally, allow null or undefined otherwise
      })
      .messages({ '*': 'Geef een geldige provincie in' }), // Error message for 'province'
    fullAddress: Joi.string()
      .required()
      .messages({ '*': 'Gelieve een adres in te vullen' }),
    telephonePrimary: Joi.string()
      .pattern(phoneNumberRegex)
      .required()
      .messages({
        '*': 'Enkel een plusteken en cijfers zijn toegelaten',
      }),
    emailPrimary: Joi.string()
      .pattern(emailRegex)
      .optional()
      .messages({ '*': 'Geef een geldig e-mailadres in' })
      .allow(''),
    websitePrimary: Joi.string()
      .optional()
      .pattern(websiteRegex)
      .allow('')
      .messages({
        '*': 'Geef een geldig internetadres in',
      }),
    telephoneSecondary: Joi.string()
      .optional()
      .pattern(phoneNumberRegex)
      .allow('')
      .messages({
        '*': 'Enkel een plusteken en nummers zijn toegelaten',
      }),
  })
  .options({ abortEarly: false });

export const warningValidation = Joi.object()
  .keys({
    siteType: Joi.optional(),
    country: Joi.optional(),
    street: Joi.optional(),
    number: Joi.optional(),
    postcode: Joi.optional(),
    municipality: Joi.optional(),
    province: Joi.optional(),
    telephonePrimary: Joi.string().pattern(belgiumPhoneNumberRegex).messages({
      '*': 'Geen Belgisch telefoonnummer. Weet je zeker dat je dit nummer wilt gebruiken?',
    }),
    fullAddress: Joi.optional(),
    emailPrimary: Joi.optional(),
    websitePrimary: Joi.string().optional(),
    telephoneSecondary: Joi.string().pattern(belgiumPhoneNumberRegex).messages({
      '*': 'Geen Belgisch telefoonnummer. Weet je zeker dat je dit nummer wilt gebruiken?',
    }),
  })
  .options({ abortEarly: false });
