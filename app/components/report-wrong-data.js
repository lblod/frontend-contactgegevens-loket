import Component from '@glimmer/component';
import config from 'frontend-contactgegevens-loket/config/environment';
import { inject as service } from '@ember/service';

export default class ReportWrongDataComponent extends Component {
  @service currentSession;
  @service store;

  get contactEmail() {
    return config.contactEmail;
  }

  get subject() {
    return 'Melden van onvolledige of foutieve data';
  }
  get body() {
    const url = encodeURIComponent(window.location.href);
    return `URL met onvolledige of foutieve data: ${url}
    \n ID : ${this.currentSession.group.id}
    \n ${this.currentSession.group.name} (${this.currentSession.groupClassificationLabel})`;
  }
}
