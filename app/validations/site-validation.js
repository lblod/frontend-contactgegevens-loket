import Joi from 'joi';

const belgiumPhoneNumberRegex = /^(?:\+32|0)[4-9][0-9]{8}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const websiteRegex = /^https:\/\//;
const phoneNumberRegex = /^(\+)?[0-9]+$/;

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
      .required()
      .messages({ '*': 'Geef een geldige provincie in' }),
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
      .messages({ '*': 'Geef een geldig e-mailadres in' }),
    websitePrimary: Joi.string().optional().pattern(websiteRegex).messages({
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
