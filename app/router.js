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

  this.route('contact-data', { path: '/contactgegevens' }, function () {
    this.route('core-data-overview', { path: '/kerngegevens' });
    this.route('core-data-edit', { path: '/bewerk-kerngegevens' });
    this.route('sites-overview', { path: '/vestigingen' });
    this.route('view-site', { path: '/bekijk-vestiging/:id' });
    this.route('edit-site', { path: '/bewerk-vestiging/:id' });
  });

  this.route('route-not-found', {
    path: '/*wildcard',
  });
});
