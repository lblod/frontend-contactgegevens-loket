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

    if (!administrativeUnitRecord)
      throw new Error(
        `The user, derived from the currentSession service, should always be associated with at least one administrative unit (also called a 'group'). This administrative unit is not present.`,
      );

    const organizationStatus =
      await administrativeUnitRecord.get('organizationStatus');
    const classification = await administrativeUnitRecord.classification;
    const primarySite = await administrativeUnitRecord.primarySite;
    const identifiers = await administrativeUnitRecord.identifiers;
    const address = await primarySite.get('address');

    // Sanity checks
    if (!primarySite)
      throw new Error(
        'Administrative unit should always have one primary site. Did not get primary site.',
      );
    if (!address)
      throw new Error(
        'Primary site should always have one address. Did not get address',
      );

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
          return (await scope.locatedWithin).label;
        })()
      : null;

    const result = {
      adminUnit: createValidatedChangeset(
        administrativeUnitRecord,
        adminUnitValidations,
      ),
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
