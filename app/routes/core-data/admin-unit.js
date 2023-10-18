import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { CONTACT_TYPE } from 'frontend-contactgegevens-loket/models/contact-point';
import { ID_NAME } from 'frontend-contactgegevens-loket/models/identifier';
import { findStructuredIdentifierByIdName, findContactByType } from './util';
import adminUnitValidations from 'frontend-contactgegevens-loket/validations/administrative-unit';
import getAddressValidations from 'frontend-contactgegevens-loket/validations/address';
import {
  kboValidations,
  ovoValidations,
} from 'frontend-contactgegevens-loket/validations/core-data';
import {
  primaryContactValidations,
  secondaryContactValidations,
} from 'frontend-contactgegevens-loket/validations/contact';
import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
import {
  IGS_CLASSIFICATION_CODES,
  CLASSIFICATION_CODE,
} from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';

/**
 * Just a little function which throws a readable error when a record is falsy.
 * Used for defensive programming and sanity checks in the code in case we get undefined when we're not supposed to
 * May help indicate issues in the backend
 */
function assertModel(record, source, modelName) {
  if (!record)
    throw new Error(
      `${source} did not have an associated ${modelName}. Did not get ${modelName} from database;`,
    );
}

export default class AdminUnitRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const administrativeUnitRecord = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
        include:
          'primary-site,primary-site.address,identifiers,identifiers.structured-identifier,organization-status,classification',
      },
    );

    assertModel(
      administrativeUnitRecord,
      'Current session',
      'administrative-unit',
    );

    const organizationStatus =
      await administrativeUnitRecord.organizationStatus;
    const classification = await administrativeUnitRecord.classification;
    const primarySite = await administrativeUnitRecord.primarySite;
    const identifiers = await administrativeUnitRecord.identifiers;
    const address = await primarySite.get('address');

    // Sanity checks
    assertModel(organizationStatus, 'admin-unit', 'organization-status');
    assertModel(classification, 'admin-unit', 'classification');
    assertModel(primarySite, 'admin-unit', 'primary-site');
    assertModel(address, 'admin-unit', 'address');

    const contacts = await primarySite.get('contacts');
    const primaryContact = findContactByType(contacts, CONTACT_TYPE.PRIMARY);
    const secondaryContact = findContactByType(
      contacts,
      CONTACT_TYPE.SECONDARY,
    );
    const kbo = await findStructuredIdentifierByIdName(
      identifiers,
      ID_NAME.KBO,
    );
    const ovo = await findStructuredIdentifierByIdName(
      identifiers,
      ID_NAME.OVO,
    );
    const nis = await findStructuredIdentifierByIdName(
      identifiers,
      ID_NAME.NIS,
    );

    const isIgs = IGS_CLASSIFICATION_CODES.includes(classification.id);
    const region = isIgs
      ? await (async () => {
          const municipality = address.municipality;
          const municipalityAdminUnits = await this.store.query(
            'administrative-unit',
            {
              filter: {
                ':exact:name': municipality,
                classification: {
                  ':id:': CLASSIFICATION_CODE.MUNICIPALITY,
                },
              },
            },
          );
          // Sanity checks
          if (municipalityAdminUnits.length === 0)
            throw new Error(
              `Impossible: Admin unit associated with municipality ${municipality} not found.`,
            );
          if (municipalityAdminUnits.length > 1)
            throw new Error(
              `Impossible: Multiple admin units associated with municipality ${municipality} found.`,
            );
          const municipalityAdminUnit = municipalityAdminUnits[0];
          const scope = await municipalityAdminUnit.scope;
          assertModel(scope, 'admin-unit of municipality', 'scope');
          return (await scope.locatedWithin).label;
        })()
      : null;

    const result = {
      adminUnit: createValidatedChangeset(
        administrativeUnitRecord,
        adminUnitValidations,
      ),
      classification,
      primarySite,
      organizationStatus,
      address: createValidatedChangeset(address, getAddressValidations(true)),
      primaryContact: createValidatedChangeset(
        primaryContact,
        primaryContactValidations,
      ),
      secondaryContact: secondaryContact
        ? createValidatedChangeset(
            secondaryContact,
            secondaryContactValidations,
          )
        : null,
      kbo: kbo ? createValidatedChangeset(kbo, kboValidations) : null,
      ovo: ovo ? createValidatedChangeset(ovo, ovoValidations) : null,
      nis: nis ?? null,
      region,
    };
    return result;
  }
}
