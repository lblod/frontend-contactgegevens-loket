import Component from '@glimmer/component';
import config from 'frontend-contactgegevens-loket/config/environment';

export default class ReportWrongDataComponent extends Component {
  get contactEmail() {
    return `${config.contactEmail}`;
  }

  get subject() {
    return 'Melden van onvolledige of foutieve data';
  }
  get body() {
    const url = encodeURIComponent(window.location.href);
    return `URL met onvolledige of foutieve data: ${url}`;
  }
}
