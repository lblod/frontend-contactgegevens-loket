import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';
import { allowedSiteMatrix } from '../validations/site-validation';
export default class SiteTypeSelectComponent extends Component {
  @service store;

  get siteTypes() {
    return this.loadSiteTypesTask.last?.value ?? [];
  }

  constructor(...args) {
    super(...args);
    this.loadSiteTypesTask.perform();
  }

  get disabled() {
    return this.args.disabled || this.loadSiteTypesTask.isRunning;
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isMunicipality() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isProvince() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isDistrict() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isAgb() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }
  get isPoliceZone() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.POLICE_ZONE
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
      this.args.administrativeUnitClassification.get('id'),
    );
  }

  get isApb() {
    return (
      this.args.administrativeUnitClassification.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }
  loadSiteTypesTask = task(async () => {
    let allTypes = await this.store.findAll('site-type', { reload: true });
    let filteredTypes = [];

    filteredTypes.push(
      allTypes.find((type) => type.id == 'f1381723dec42c0b6ba6492e41d6f5dd'), // Maatschappelijke zetel
    );

    if (this.isWorshipAdministrativeUnit) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'dd0418307e7038c0c3809e3ec03a0932'), // Hoofdgebouw erediensten
      );
    } else if (this.isMunicipality) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '57e8e5498ca84056b8a87631a26c90af'), // Gemeentehuis
      );
      filteredTypes.push(
        allTypes.find((type) => type.id == 'fbec5e94aba343b0a7361aca8a0c7d79'), // Ander administratief adres
      );
    } else if (this.isAgb || this.isApb || this.isIGS) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == 'dcc01338-842c-4fbd-ba68-3ca6f3af975c',
        ), // CorrespondentieAddres
      );
    } else if (this.isProvince) {
      filteredTypes.push(
        allTypes.find((type) => type.id == '15f2683c61b74541b27b64b4365806c7'), // Provinciehuis
      );
    } else if (this.isDistrict) {
      filteredTypes.push(
        allTypes.find((type) => type.id == 'db13a289b78e42d19d8d1d269b61b18f'), // Districtshuis
      );
    } else if (this.isPoliceZone) {
      filteredTypes.push(
        allTypes.find(
          (type) => type.id == '0ed15289-1f3d-4172-8c46-0506de5aa2a3',
        ), // Hoofdcommissariaat
      );
    }

    return filteredTypes;
  });
}
