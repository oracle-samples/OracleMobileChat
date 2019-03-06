/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
/**
 * Example of Require.js boostrap javascript
 */
'use strict';
requirejs.config({
  // Path mappings for the logical module names
  paths:
  //injector:mainReleasePaths
  {
    'knockout': 'libs/knockout/knockout-3.4.2.debug',
    'mapping': 'libs/knockout/knockout.mapping',
    'jquery': 'libs/jquery/jquery-3.3.1',
    'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
    'customElements': 'libs/webcomponents/custom-elements.min',
    'css': 'libs/require-css/css',
    'appConfig': 'appConfigExternal'
  }
  //endinjector
  ,
  // Shim configurations for modules that do not expose AMD
  shim: {
    'jquery': {
      exports: ['jQuery', '$']
    }
  },
  // Increase timeout threshold to 30 seconds..
  waitSeconds: 30
});
/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require(['ojs/ojcore', 'knockout', 'appController'], function (oj, ko, app) {

  $(function() {

    function init() {
      oj.Router.sync().then(function () {
        // bind your ViewModel for the content of the whole page body.
        ko.applyBindings(app, document.getElementById('page'));
      }, function (error) {
        oj.Logger.error('Error in root start: ' + error.message);
      });
    }

    // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
    // event before executing any code that might interact with Cordova APIs or plugins.
    if ($(document.body).hasClass('oj-hybrid')) {
      document.addEventListener("deviceready", init);
    } else {
      init();
    }

  });

});
