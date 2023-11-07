import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'frontend-contactgegevens-loket/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}
Object.defineProperty(Array.prototype, '_super', {
  enumerable: false,
});

loadInitializers(App, config.modulePrefix);
