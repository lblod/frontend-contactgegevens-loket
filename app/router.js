import EmberRouter from '@ember/routing/router';
import config from 'frontend-contactgegevens-loket/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('mock-login');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });
  this.route('test');

  this.route('core-data', { path: '/kerngegevens' }, function () {
    this.route('view', { path: '/bekijk' });
    this.route('edit', { path: '/bewerk' });
  });
  this.route('sites', { path: '/vestigingen' }, function () {
    this.route('site', { path: '/:id' }, function () {
      this.route('edit', { path: '/bewerk' });
    });
  });

  this.route('route-not-found', {
    path: '/*wildcard',
  });
});
