import Model, { attr } from '@ember-data/model';

/** @type { Record<string,string> } */

/** @type { Record<string,{id:string,label:string}> } */
export const CLASSIFICATION = {
  MUNICIPALITY: {
    id: '5ab0e9b8a3b2ca7c5e000001',
    label: 'Gemeente',
  },
  POLICE_ZONE: {
    id: 'a3922c6d-425b-474f-9a02-ffb71a436bfc',
    label: 'PolitieZone',
  },
  PROVINCE: {
    id: '5ab0e9b8a3b2ca7c5e000000',
    label: 'Provincie',
  },
  OCMW: {
    id: '5ab0e9b8a3b2ca7c5e000002',
    label: 'OCMW',
  },
  DISTRICT: {
    id: '5ab0e9b8a3b2ca7c5e000003',
    label: 'District',
  },
  WORSHIP_SERVICE: {
    id: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
    label: 'Bestuur van de eredienst',
  },
  CENTRAL_WORSHIP_SERVICE: {
    id: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
    label: 'Centraal bestuur van de eredienst',
  },
  AGB: {
    id: '36a82ba0-7ff1-4697-a9dd-2e94df73b721',
    label: 'Autonoom gemeentebedrijf',
  },
  APB: {
    id: '80310756-ce0a-4a1b-9b8e-7c01b6cc7a2d',
    label: 'Autonoom provinciebedrijf',
  },
  PROJECTVERENIGING: {
    id: 'b156b67f-c5f4-4584-9b30-4c090be02fdc',
    label: 'Projectvereniging',
  },
  DIENSTVERLENENDE_VERENIGING: {
    id: 'd01bb1f6-2439-4e33-9c25-1fc295de2e71',
    label: 'Dienstverlenende vereniging',
  },
  OPDRACHTHOUDENDE_VERENIGING: {
    id: 'cd93f147-3ece-4308-acab-5c5ada3ec63d',
    label: 'Opdrachthoudende vereniging',
  },
  OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME: {
    id: '4b8450cf-a326-4c66-9e63-b4ec10acc7f6',
    label: 'Opdrachthoudende vereniging met private deelname',
  },
  ASSISTANCE_ZONE: {
    id: 'ea446861-2c51-45fa-afd3-4e4a37b71562',
    label: 'Hulpverleningszone',
  },
  REPRESENTATIVE_BODY: {
    // FIXME this is not an administrative unit
    id: '89a00b5a-024f-4630-a722-65a5e68967e5',
    label: 'Representatief orgaan',
  },
};
export const CLASSIFICATION_CODE = {
  MUNICIPALITY: CLASSIFICATION.MUNICIPALITY.id,
  PROVINCE: CLASSIFICATION.PROVINCE.id,
  OCMW: CLASSIFICATION.OCMW.id,
  DISTRICT: CLASSIFICATION.DISTRICT.id,
  WORSHIP_SERVICE: CLASSIFICATION.WORSHIP_SERVICE.id,
  CENTRAL_WORSHIP_SERVICE: CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
  AGB: CLASSIFICATION.AGB.id,
  APB: CLASSIFICATION.APB.id,
  PROJECTVERENIGING: CLASSIFICATION.PROJECTVERENIGING.id,
  DIENSTVERLENENDE_VERENIGING: CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
  OPDRACHTHOUDENDE_VERENIGING: CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
  OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME:
    CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
  POLICE_ZONE: CLASSIFICATION.POLICE_ZONE.id,
  ASSISTANCE_ZONE: CLASSIFICATION.ASSISTANCE_ZONE.id,
  REPRESENTATIVE_BODY: CLASSIFICATION.REPRESENTATIVE_BODY.id,
};

/** @type { string[] } */
export const IGS_CLASSIFICATION_CODES = [
  CLASSIFICATION_CODE.PROJECTVERENIGING,
  CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
  CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
  CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
];

/** @type { string[] } */
export const AGB_ABP_CLASSIFICATION_CODES = [
  CLASSIFICATION_CODE.PROJECTVERENIGING,
  CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
  CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
  CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
];

export default class AdministrativeUnitClassificationCodeModel extends Model {
  @attr label;

  get isAgbOrApb() {
    return IGS_CLASSIFICATION_CODES.includes(this.id);
  }

  get isIgs() {
    return AGB_ABP_CLASSIFICATION_CODES.includes(this.id);
  }
}
