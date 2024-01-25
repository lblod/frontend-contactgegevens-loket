import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import { SITE_CODE } from '../../../models/site';
export default class ContactDataEditSiteRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
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
      siteTypeIds.push((await sites[i].siteType).id);
    }
    siteTypeIds.push((await primarySite.siteType).id);
    const initialObject = Object.keys(SITE_CODE).reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {});
    const siteTypeCount = siteTypeIds.reduce((acc, current) => {
      const key = Object.keys(SITE_CODE).find(
        (key) => SITE_CODE[key] === current,
      );
      if (!key)
        throw new Error(
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
    return {
      site,
      address,
      siteId,
      primaryContact,
      secondaryContact,
      adminUnit,
      primarySite,
      siteTypeCount,
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
