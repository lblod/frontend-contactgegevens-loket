import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  appTitle = 'Contactgegevens';

  currentSession = {
    user: {
      voornaam: 'Karel',
      achternaam: 'Kilogram',
    },
    groupClassification: {
      label: 'DummyClass',
    },
    group: {
      naam: 'DummyGroup',
    },
  };

  get isIndex() {
    return this.router.currentRouteName === 'index';
  }
}
