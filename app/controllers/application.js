import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service currentSession;
  @service router;

  appTitle = 'Contactgegevens';
  get isLocalhost() {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]'
    ) {
      return true;
    } else {
      return false;
    }
  }
  get environmentName() {
    const thisEnvironmentName = this.isLocalhost
      ? 'local'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentName;

    return thisEnvironmentName;
  }
  get isIndex() {
    return this.router.currentRouteName === 'index';
  }
  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentInfo.title !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }

  get environmentInfo() {
    let environment = this.environmentName;
    switch (environment) {
      case 'QA':
        return {
          title: 'testomgeving',
          skin: 'warning',
        };
      case 'DEV':
        return {
          title: 'ontwikkelomgeving',
          skin: 'success',
        };
      case 'local':
        return {
          title: 'lokale omgeving',
          skin: 'error',
        };
      default:
        return {
          title: '',
        };
    }
  }
}
