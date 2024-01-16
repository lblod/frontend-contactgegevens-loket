import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';

/**
 * Transforms a Joi validation error to a simple hash of keys and error massages
 * @param { import("joi").ValidationError['details'] } validationDetails
 * @returns { Record<string,string> }
 */
export function mapValidationDetailsToErrors(validationDetails) {
  return validationDetails.reduce((accumulator, detail) => {
    accumulator[detail.context.key] = detail.message;
    return accumulator;
  }, {});
}

/**
 *
 * @param { import('../../models/address').AddressModel } addressModel
 * @param { import('../../components/au-address-search').Address } addressSearchAddress
 */
export function copyAddressSearchAddressToAddressModel(
  addressModel,
  addressSearchAddress,
) {
  addressModel.number = addressSearchAddress.houseNumber;
  addressModel.boxNumber = addressSearchAddress.boxNumber ?? null;
  addressModel.street = addressSearchAddress.street;
  addressModel.postcode = addressSearchAddress.postalCode;
  addressModel.municipality = addressSearchAddress.municipality;
  addressModel.province = addressSearchAddress.province;
  addressModel.country = addressSearchAddress.country;
  addressModel.fullAddress = combineFullAddress(addressModel);
}

/**
 *
 * @param { import('../../models/address').AddressModel } addressModel
 * @returns { import('../../components/au-address-search').Address }
 */
export function createAddressSearchAddressFromAddressModel(addressModel) {
  return {
    houseNumber: addressModel?.number,
    boxNumber: addressModel?.boxNumber,
    street: addressModel?.street,
    postalCode: addressModel?.postcode,
    municipality: addressModel?.municipality,
    province: addressModel?.province,
    country: addressModel?.country,
  };
}
