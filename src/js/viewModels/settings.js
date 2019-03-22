/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
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
