import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ID_NAME } from 'frontend-contactgegevens-loket/models/identifier';
import { CONTACT_TYPE } from 'frontend-contactgegevens-loket/models/contact-point';
import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
// import { Changeset } from 'ember-changeset'; // not used ?
import { getAddressValidations } from 'frontend-contactgegevens-loket/validations/address';
import adminUnitValidations from 'frontend-contactgegevens-loket/validations/administrative-unit';
import {
  kboValidations,
  ovoValidations,
} from 'frontend-contactgegevens-loket/validations/core-data';
import contactValidations from 'frontend-contactgegevens-loket/validations/contact';
// import secondaryContactValidations from 'frontend-contactgegevens-loket/validations/secondary-contact-point'; // not used ?

import {
  findStructuredIdentifierByIdName,
  findContactByType,
} from 'frontend-contactgegevens-loket/utils/util';

export default class CoreDataEditRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const administrativeUnitRecord = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
        include:
          'primary-site,primary-site.address,identifiers,identifiers.structured-identifier,organization-status',
      },
    );
    if (!administrativeUnitRecord)
      throw new Error(
        `The user, derived from the currentSession service, should always be associated with at least one administrative unit (also called a 'group'). This administrative unit is not present.`,
      );

    const organizationStatus =
      await administrativeUnitRecord.get('organizationStatus');
    const primarySite = await administrativeUnitRecord.primarySite;
    const identifiers = await administrativeUnitRecord.identifiers;
    const address = await primarySite.get('address');
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
        contactValidations,
      ),
      secondaryContact: secondaryContact
        ? createValidatedChangeset(secondaryContact, contactValidations)
        : null,
      kbo: kbo ? createValidatedChangeset(kbo, kboValidations) : null,
      ovo: ovo ? createValidatedChangeset(ovo, ovoValidations) : null,
      nis,
    };
    return result;
  }
}
