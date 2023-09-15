import EmberRouter from '@ember/routing/router';
import config from 'frontend-contactgegevens-loket/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('mock-login');

  this.route('contact-data', { path: '/contactgegevens' }, function () {
    this.route('core-data-overview', { path: '/kerngegevens' });
    this.route('core-data-edit', { path: '/bewerk-kerngegevens' });
    this.route('sites', { path: '/vestigingen' }, function () {
      this.route('site', { path: '/:id/' }, function () {
        this.route('edit');
      });
    });
  });
});
