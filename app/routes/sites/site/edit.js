import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import { SITE_CODE } from '../../../models/site';
import config from 'frontend-contactgegevens-loket/config/environment';
export default class ContactDataEditSiteRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  get editFeature() {
    const editFeature = config.features['edit-feature'];
    return editFeature === true || editFeature === 'true';
  }
  beforeModel() {
    if (!this.currentSession.canEdit || !this.editFeature) {
      this.router.transitionTo('page-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    const completeAdminUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
        include: 'sites,primary-site,sites.site-type,primary-site.site-type',
      },
    );
    const sites = await completeAdminUnit.sites;
    const primarySite = await completeAdminUnit.primarySite;
    const siteTypeIds = [];

    for (let i = 0; i < sites.length; i++) {
      const siteType = await sites[i].siteType;
      if (siteType) {
        siteTypeIds.push(siteType.id);
      }
    }
    const primarySiteType = await primarySite.siteType;
    if (primarySiteType) {
      siteTypeIds.push(primarySiteType.id);
    }
    const initialObject = Object.keys(SITE_CODE).reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {});
    /** @type {Record<keyof SITE_CODE,number>} */
    const siteTypeCount = siteTypeIds.reduce((acc, current) => {
      const key = Object.keys(SITE_CODE).find(
        (key) => SITE_CODE[key] === current,
      );
      if (!key)
        console.error(
          `Id ${current} not found in site keys ${Object.keys(
            SITE_CODE,
          )}. Impossible`,
        );
      acc[key]++;
      return acc;
    }, initialObject);
    const params = this.paramsFor('sites.site');
    const siteId = params.id;
    const site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: 'address,contacts,site-type',
    });
    const adminUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
      },
    );

    const contacts = await site.contacts;
    const address = await site.address;
    const primaryContact =
      findPrimaryContact(contacts) ?? createPrimaryContact(this.store);
    const secondaryContact =
      findSecondaryContact(contacts) ?? createSecondaryContact(this.store);

    const siteTypeKeyBeforeSave = Object.keys(SITE_CODE).find(
      (key) => SITE_CODE[key] === site.siteType.id,
    );
    if (!siteTypeKeyBeforeSave)
      console.error(
        `Impossible. Cannot find site type id in site type data structure.`,
      );
    return {
      site,
      address,
      siteId,
      primaryContact,
      secondaryContact,
      adminUnit,
      primarySite,
      siteTypeCount,
      siteTypeKeyBeforeSave,
    };
  }
  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
