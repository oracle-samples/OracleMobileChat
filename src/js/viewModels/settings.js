/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */

// settins viewModel of the app

'use strict';
define(['appController', 'knockout', 'ojs/ojswitch', 'ojs/ojbutton', 'ojs/ojradioset'], function(app, ko) {

  function settingsViewModel() {
    var self = this;

    // adjust content padding top
    self.handleTransitionCompleted = function(info) {  
      app.appUtilities.adjustContentPadding();
    };

    // settings page header
    self.settingsHeaderSettings = {
      name:'basicHeader',
      params: {
        title: 'Settings',
        startBtn: {
          id: 'navDrawerBtn',
          click: app.toggleDrawer,
          display: 'icons',
          label: 'Back',
          icons: 'oj-fwk-icon oj-fwk-icon-hamburger',
          visible: true
        },
        endBtn: {
          visible: false
        }
      }
    };
  }

  return settingsViewModel;
});
