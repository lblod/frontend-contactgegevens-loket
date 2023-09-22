import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { CONTACT_TYPE } from '../../models/contact-point';
import EmberObject from '@ember/object';
import { ID_NAME } from '../../models/identifier';

// const hardcodedAdministrativeUnitDataForDemo = {
//   name: 'Aalst',
//   classification: {
//     label: 'OCMW',
//   },
//   organizationStatus: {
//     id: '63cc561de9188d64ba5840a42ae8f0d6',
//     label: 'Actief',
//   },
//   identifiers: [
//     {
//       idName: 'KBO nummer',
//       structuredIdentifier: {
//         localId: '0212.237.186',
//       },
//     },
//     {
//       idName: 'SharePoint identificator',
//       structuredIdentifier: {
//         localId: '324',
//       },
//     },
//     {
//       idName: 'OVO-nummer',
//       structuredIdentifier: {
//         localId: 'OVO002601',
//       },
//     },
//   ],
//   primarySite: {
//     address: {
//       fullAddress: 'Gasthuisstraat 40, 9300 Aalst, België',
//       province: 'Oost-Vlaanderen',
//     },
//     contacts: [
//       {
//         telephone: '081000000',
//         email: 'fakeemail@gmail.com',
//         website: 'https://google.com',
//       },
//       {
//         telephone: '081000002',
//         email: 'fakeemail2@gmail.com',
//         website: 'https://wikipedia.org',
//       },
//     ],
//   },
// };

export default class CoreDataOverviewRoute extends Route {
  @service store;
  @service currentSession;

  async realDataModel() {
    const administrativeUnitRecord = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
    );
    if (!administrativeUnitRecord)
      throw new Error(
        `The user, derived from the currentSession service, should always be associated with at least one administrative unit (also called a 'group'). Please check the data in the back-end.`,
      );

    const primarySite = await administrativeUnitRecord.primarySite;
    const address = await primarySite.address; // null?

    const contacts = await primarySite.contacts;
    const identifiers = await administrativeUnitRecord.identifiers; // []
    const primaryContact = contacts.find(
      (contactPoint) => contactPoint.type === CONTACT_TYPE.PRIMARY,
    );
    const secondaryContact = contacts.find(
      (contactPoint) => contactPoint.type === CONTACT_TYPE.SECONDARY,
    );

    const kbo = (
      await identifiers.find((identifier) => identifier.idName === ID_NAME.KBO)
        .structuredIdentifier
    ).localId;
    const ovo = (
      await identifiers.find((identifier) => identifier.idName === ID_NAME.OVO)
        .structuredIdentifier
    ).localId;

    // No administrative unit is an error
    // No site is not an error but I should display a message

    return {
      administrativeUnit: administrativeUnitRecord,
      address,
      primaryContact,
      secondaryContact,
      kbo,
      ovo,
    };
  }
  async fakeDataModel() {
    const administrativeUnitRecord = hardcodedAdministrativeUnitDataForDemo;
    const primarySite = hardcodedAdministrativeUnitDataForDemo.primarySite;
    const address = primarySite.address;
    const contacts = primarySite.contacts;
    const primaryContact = contacts[0];
    const secondaryContact = contacts[1];
    const kbo = 'Dummy';
    const ovo = 'Dummy';
    return {
      administrativeUnit: administrativeUnitRecord,
      address,
      primaryContact,
      secondaryContact,
      kbo,
      ovo,
    };
  }

  async model(params) {
    console.log(params);
    if (params.fake) {
      return this.fakeDataModel();
    }
    return this.realDataModel();
  }
}
