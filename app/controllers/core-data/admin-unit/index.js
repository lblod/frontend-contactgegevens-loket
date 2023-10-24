import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';
import { ID_NAME } from '../../../models/identifier';
const SHAREPOINT_LINK_BASE = {
  WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20Eredienstbesturen/AllItems.aspx?view=7&q=',
  CENTRAL_WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20CKB1/AllItems.aspx?view=7&q=',
  MUNICIPALITY:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  DISTRICT:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  PROVINCE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  OCMW: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  AGB: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  APB: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  IGS: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  POLICE_ZONE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  ASSISTANCE_ZONE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
};

export default class CoreDataAdminUnitIndexController extends Controller {
  @service currentSession;

  isSharePointIdentifier(identifier) {
    return identifier?.idName === ID_NAME.SHAREPOINT;
  }

  isKboIdentifier(identifier) {
    return identifier?.idName === ID_NAME.KBO;
  }

  isNisCodeIdentifier(identifier) {
    return identifier?.idName === ID_NAME.NIS;
  }

  isOvoCodeIdentifier(identifier) {
    return identifier?.idName === ID_NAME.OVO;
  }

  get sharepointIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isSharePointIdentifier(id),
    );
  }

  get kboIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isKboIdentifier(id),
    );
  }

  get nisIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isNisCodeIdentifier(id),
    );
  }

  get ovoIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isOvoCodeIdentifier(id),
    );
  }
  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isProvince() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isDistrict() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isOCMW() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.OCMW
    );
  }

  get isAgb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }

  get isApb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  get isIGS() {
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
    return typesThatAreIGS.includes(
      this.model.administrativeUnit.classification?.get('id'),
    );
  }

  get isPoliceZone() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.POLICE_ZONE
    );
  }

  get isAssistanceZone() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.ASSISTANCE_ZONE
    );
  }

  get sharePointLinkBase() {
    if (this.isWorshipService) {
      return SHAREPOINT_LINK_BASE.WORSHIP_SERVICE;
    } else if (this.isDistrict) {
      return SHAREPOINT_LINK_BASE.DISTRICT;
    } else if (this.isProvince) {
      return SHAREPOINT_LINK_BASE.PROVINCE;
    } else if (this.isMunicipality) {
      return SHAREPOINT_LINK_BASE.MUNICIPALITY;
    } else if (this.isOCMW) {
      return SHAREPOINT_LINK_BASE.OCMW;
    } else if (this.isAgb) {
      return SHAREPOINT_LINK_BASE.AGB;
    } else if (this.isApb) {
      return SHAREPOINT_LINK_BASE.APB;
    } else if (this.isIGS) {
      return SHAREPOINT_LINK_BASE.IGS;
    } else if (this.isPoliceZone) {
      return SHAREPOINT_LINK_BASE.POLICE_ZONE;
    } else if (this.isAssistanceZone) {
      return SHAREPOINT_LINK_BASE.ASSISTANCE_ZONE;
    }
    return SHAREPOINT_LINK_BASE.CENTRAL_WORSHIP_SERVICE;
  }

  get expiredExpectedEndDate() {
    const expectedEndDate = this.model.administrativeUnit.expectedEndDate;
    return expectedEndDate && expectedEndDate < new Date();
  }
}
