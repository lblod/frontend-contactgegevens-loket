import EmberRouter from '@ember/routing/router';
import ENV from 'frontend-contactgegevens-loket/config/environment';
export default class Router extends EmberRouter {
  location = ENV.locationType;
  rootURL = ENV.rootURL;
}
Router.map(function () {
  this.route('login');
  if (ENV.controllerLogin !== 'true') {
    this.route('mock-login');
    this.route('switch-login');
  } else {
    this.route('controller-login');
  }

  this.route('contact');
  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('callback-error');
    this.route('login');
    this.route('logout');
    if (ENV.controllerLogin !== 'true') {
      if (ENV.acmidm.clientId === '{{OAUTH_API_KEY}}') {
        this.route('mock-login');
      }
      this.route('switch-login');
    } else {
      this.route('controller-login');
    }
  });

  this.route('index', { path: '/' });

  this.route('legal', { path: '/legaal' }, function () {
    this.route('accessibilitystatement', {
      path: '/toegangkelijkheidsverklaring',
    });
    this.route('cookiestatement', {
      path: '/cookieverklaring',
    });
    this.route('disclaimer');
  });

  this.route('core-data', { path: '/kerngegevens' }, function () {
    this.route('admin-unit', { path: '/bestuurseenheid' }, function () {
      this.route('index', { path: '/' });
    });
  });
  this.route('sites', { path: '/vestigingen' }, function () {
    this.route('new', { path: '/nieuw' });
    this.route('site', { path: '/:id' }, function () {
      this.route('edit', { path: '/bewerk' });
    });
  });

  this.route('page-not-found', {
    path: '/*wildcard',
  });
});
