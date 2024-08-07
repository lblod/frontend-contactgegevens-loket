import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import { tracked } from '@glimmer/tracking';
import { SITE_CODE } from '../../models/site';
import config from 'frontend-contactgegevens-loket/config/environment';
export default class CreateSitesNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;
  @tracked selectCountSite = 0;
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
  @action
  async model() {
    const address = this.store.createRecord('address');
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
    address.country = 'België';
    return {
      adminUnit: this.currentSession.group,
      site: this.store.createRecord('site'),
      address: address,
      primaryContact: createPrimaryContact(this.store),
      secondaryContact: createSecondaryContact(this.store),
      siteTypeCount,
    };
  }
}
