import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { CONTACT_TYPE } from 'frontend-contactgegevens-loket/models/contact-point';
import { ID_NAME } from 'frontend-contactgegevens-loket/models/identifier';
import { findStructuredIdentifierByIdName, findContactByType } from './util';
import {
  IGS_CLASSIFICATION_CODES,
  CLASSIFICATION_CODE,
} from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';

/**
 * Just a little function which throws a readable error when a record is falsy.
 * Used for defensive programming and sanity checks in the code in case we get undefined when we're not supposed to
 * May help indicate issues in the backend
 */
function assert(record, source, modelName) {
  if (!record)
    throw new Error(
      `${source} did not have an associated ${modelName}. Did not get ${modelName} from database;`,
    );
}

export default class AdminUnitRoute extends Route {
  @service store;
  @service currentSession;
  async model() {
    // Re load the admin unit and make sure we get as moch data as possible right away
    const adminUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
        include:
          'primary-site,primary-site.address,identifiers,identifiers.structured-identifier,organization-status,classification',
      },
    );
    assert(adminUnit, 'Current session', 'administrative-unit');

    const organizationStatus = await adminUnit.organizationStatus;
    const classification = await adminUnit.classification;
    const primarySite = await adminUnit.primarySite;
    const identifiers = await adminUnit.identifiers;
    const address = await primarySite.get('address');

    // Sanity checks
    assert(organizationStatus, 'admin-unit', 'organization-status');
    assert(classification, 'admin-unit', 'classification');
    assert(primarySite, 'admin-unit', 'primary-site');
    assert(address, 'admin-unit', 'address');

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
    const sharepoint = await findStructuredIdentifierByIdName(
      identifiers,
      ID_NAME.SHAREPOINT,
    );
    const isIgs = IGS_CLASSIFICATION_CODES.includes(classification.id);
    const isMunicipality =
      adminUnit.classification.id === CLASSIFICATION_CODE.MUNICIPALITY;
    const isOCMW = adminUnit.classification.id === CLASSIFICATION_CODE.OCMW;
    const isAPB = adminUnit.classification.id === CLASSIFICATION_CODE.APB;
    const isDistrict =
      adminUnit.classification.id === CLASSIFICATION_CODE.DISTRICT;
    const isProvince =
      adminUnit.classification.id === CLASSIFICATION_CODE.PROVINCE;
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
          assert(scope, 'admin-unit of municipality', 'scope');
          return (await scope.locatedWithin).label;
        })()
      : null;
    const changeEvents = [...(await adminUnit.changedBy)]
    let isCity = false;
    for (const event of changeEvents) {
      const eventType = await event.type;
      const eventTypeId = eventType.id;
      if (eventTypeId == 'e4c3d1ef-a34d-43b0-a18c-f4e60e2c8af3') {
        isCity = true;
      }
    }
    const result = {
      adminUnit,
      classification,
      primarySite,
      organizationStatus,
      address,
      primaryContact,
      secondaryContact, // May be null
      isIgs,
      isCity,
      kbo, // May be null
      ovo, // May be null
      nis, // May be null
      sharepoint, // May be null
      region, // May be null
      isMunicipality,
      isOCMW,
      isAPB,
      isDistrict,
      isProvince,
    };
    return result;
  }
}
