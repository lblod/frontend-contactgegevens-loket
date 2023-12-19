import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'frontend-contactgegevens-loket/config/environment';

export default class AuthLoginRoute extends Route {
  @service session;

  beforeModel() {
    if (this.session.prohibitAuthentication('index')) {
      console.log(ENV.acmidm);
      window.location.replace(buildLoginUrl(ENV.acmidm));
    }
  }
}

function buildLoginUrl({ authUrl, clientId, authRedirectUrl, scope }) {
  let loginUrl = new URL(authUrl);
  let searchParams = loginUrl.searchParams;
  searchParams.append('response_type', encodeURIComponent('code'));
  searchParams.append('client_id', encodeURI frnComponent(clientId));
  searchParams.append('redirect_uri', encodeURIComponent(authRedirectUrl));
  searchParams.append('scope', encodeURIComponent(scope));

  return loginUrl.href;
}
