import EmberRouter from '@ember/routing/router';
import config from 'frontend-contactgegevens-loket/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('mock-login');
  this.route('login');
  this.route('contact');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  this.route('core-data', { path: '/kerngegevens' }, function () {
    this.route('admin-unit', { path: '/bestuurseenheid' }, function () {
      this.route('index', { path: '/' });
    });
  });
  this.route('sites', { path: '/vestigingen' }, function () {
    // this.route('new', { path: '/nieuw' });
    this.route('site', { path: '/:id' }, function () {
      // this.route('edit', { path: '/bewerk' });
    });
  });

  this.route('route-not-found', {
    path: '/*wildcard',
  });
});
