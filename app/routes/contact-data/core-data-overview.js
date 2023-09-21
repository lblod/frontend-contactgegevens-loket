import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { CONTACT_TYPE } from '../../models/contact-point';
import EmberObject from '@ember/object';

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

  async model() {
    const administrativeUnitRecord = this.currentSession.group;
    if (!administrativeUnitRecord)
      throw new Error(
        `The user, derived from the currentSession service, should always be associated with at least one administrative unit (also called a 'group'). Please check the data in the back-end.`,
      );

    const primarySite = await administrativeUnitRecord.primarySite;
    const address = await primarySite.address; // Hier bekakt ie -> 500 WHY? Backend shittery
    const debug = EmberObject.create({
      administrativeUnitRecord,
      primarySite,
      address,
    });
    console.log(debug.getProperties('administrativeUnitRecord', 'primarySite'));

    // const contacts = await primarySite.get('contacts');
    // const primaryContact = contacts.find(
    //   (contactPoint) => (contactPoint.type = CONTACT_TYPE.PRIMARY),
    // );
    // const secondaryContact = contacts.find(
    //   (contactPoint) => (contactPoint.type = CONTACT_TYPE.SECONDARY),
    // );

    // const kbo = administrativeUnitRecord.identifiers.find(
    //   (sub) => sub.idName === 'KBO nummer',
    // ).structuredIdentifier.localId;
    // const ovo = administrativeUnitRecord.identifiers.find(
    //   (sub) => sub.idName === 'OVO-nummer',
    // ).structuredIdentifier.localId;

    // No administrative unit is an error
    // No site is not an error but I should display a message

    return {
      administrativeUnit: administrativeUnitRecord,
      address: undefined,
      primaryContact: undefined,
      secondaryContact: undefined,
      kbo: undefined,
      ovo: undefined,
      // address,
      // primaryContact,
      // secondaryContact,
      // kbo,
      // ovo,
    };
  }
}
