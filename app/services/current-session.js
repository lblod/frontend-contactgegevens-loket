import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  /**
   * Is actually administrative unit associated with this user
   */
  @tracked group;
  @tracked groupClassification;
  @tracked roles = [];

  async load() {
    if (this.session.isAuthenticated) {
      let accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });

      this.user = await this.account.user;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      let groupId = this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('administrative-unit', groupId, {
        include: 'classification',
      });
      this.groupClassification = await this.group.classification;
    }
  }

  get canEdit() {
    return true; // for demo purposes only -> change asap
  }

  get fullName() {
    // This is reactive
    return this.user ? this.user.fullName : 'Gebruiker aan het laden';
  }

  get groupClassificationLabel() {
    // This is reactive
    return this.groupClassification
      ? this.groupClassification.label
      : 'Classificatie aan het laden';
  }
}
