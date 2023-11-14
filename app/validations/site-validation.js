import Joi from 'joi';

const belgiumPhoneNumberRegex = /^(?:\+32|0)[4-9][0-9]{8}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const websiteRegex = /^https:\/\//;

export const errorValidation = Joi.object({
  siteType: Joi.string()
    .required()
    .messages({ '*': 'Please choose a site type' }),
  country: Joi.string()
    .required()
    .messages({ '*': 'Please fill in a valid country' }),
  street: Joi.string()
    .required()
    .messages({ '*': 'Please fill in a valid street name' }),
  number: Joi.string()
    .required()
    .messages({ '*': 'Please fill in a valid housenumber' }),
  postcode: Joi.string()
    .required()
    .messages({ '*': 'Please fill in a postalcode' }),
  municipality: Joi.string()
    .required()
    .messages({ '*': 'Please fill in a valid municipality' }),
  province: Joi.string()
    .required()
    .messages({ '*': 'Please fill in a valid province' }),
  fullAddress: Joi.string()
    .required()
    .messages({ '*': 'Please choose a address' }),
  telephonePrimary: Joi.string()
    .required()
    .pattern(belgiumPhoneNumberRegex)
    .messages({ '*': 'Please fill in a valid Belgium phone number' }),
  emailPrimary: Joi.string()
    .pattern(emailRegex)
    .messages({ '*': 'Please fill in a valid email' }),
  websitePrimary: Joi.string().optional().pattern(websiteRegex).messages({
    '*': 'Please fill in a valid URL. Example: https://www.vlaanderen.be',
  }),
  telephoneSecondary: Joi.string()
    .optional()
    .allow('')
    .pattern(belgiumPhoneNumberRegex)
    .messages({ '*': 'Please fill in a valid Belgium phone number' }),
}).options({ abortEarly: false });
