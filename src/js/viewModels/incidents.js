/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
// This incidents viewModel controls dashboard/list/map tabs.

'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'dataService', 'appController', 'ojs/ojknockout', 'ojs/ojpopup', 'ojs/ojpulltorefresh'], function(oj, ko, $, data, app) {

  function incidentsViewModel() {

    var self = this;

    self.showFilterBtn = ko.observable(false);

    self.previousTab = null;

    self.handleDeactivated = function(info) {
      oj.PullToRefreshUtils.tearDownPullToRefresh('body');
    };

    self.handleActivated = function(params) {

      // setup child router
      var parentRouter = params.valueAccessor().params['ojRouter']['parentRouter'];

      self.router = parentRouter.createChildRouter('incidentsTab').configure({
        'tabdashboard': { label: 'Dashboard', isDefault: true },
        'tablist': { label: 'Incidents List' },
        'tabmap': { label: 'Map' }
      });

      self.moduleConfig = ko.observable();

      ko.computed(function () {
        var tabAnimations = {
          'navSiblingEarlier': oj.ModuleAnimations.createAnimation({'effect':'slideOut','direction':'start','persist':'all'}, {'effect':'slideIn','direction':'start'}, false),
          'navSiblingLater': oj.ModuleAnimations.createAnimation({'effect':'slideOut','direction':'end','persist':'all'}, {'effect':'slideIn','direction':'end'}, false)
        };

        var animation = null;

        // determine animation type based on current and previous tab
        switch(self.previousTab) {
          case 'tabdashboard':
            animation = tabAnimations['navSiblingEarlier']
            break;
          case 'tablist':
            if(self.router.stateId() === 'tabdashboard') {
              animation = tabAnimations['navSiblingLater']
            } else {
              animation = tabAnimations['navSiblingEarlier']
            }
            break;
          case 'tabmap':
            animation = tabAnimations['navSiblingLater']
        }

        if (self.router.stateId()) {
          self.moduleConfig({
            name: self.router.stateId(),
            cacheKey: self.router.stateId(),
            animation: animation
          });
        }
      });

      self.router.stateId.subscribe(function(newValue) {
        if(typeof newValue !== "undefined") {
          if(newValue === 'tablist') {
            self.showFilterBtn(true);
          } else {
            self.showFilterBtn(false);
          }
        }
      });

      return oj.Router.sync();
    };

    self.dispose = function(info) {
      self.router.dispose();
    };

    // store previousTab to determine animation type
    self.navBarChange = function(event) {
      self.previousTab = event.detail.previousValue;
    };

    self.closePopup = function() {
      return document.getElementById('filterpopup').close();
    };

    // settings for headers on incidents page
    self.incidentsHeaderSettings = {
      name: 'basicHeader',
      params: {
        title: 'Incidents',
        startBtn: {
          id: 'navDrawerBtn',
          click: app.toggleDrawer,
          display: 'icons',
          label: 'Navigation Drawer',
          icons: 'oj-fwk-icon oj-fwk-icon-hamburger',
          visible: true
        },
        endBtn: {
          id: 'filterPopUpBtn',
          click: function() {
            var popup = document.getElementById('filterpopup');
            popup.position = {
              "my": {
                "horizontal": "end",
                "vertical": "top"
              },
              "at": {
                "horizontal": "end",
                "vertical": "bottom"
              },
              "of": ".oj-hybrid-applayout-header-no-border",
              "offset": {
                "x": -10,
                "y": 0
              }
            };

            // place initial focus on the popup instead of the first focusable element
            popup.initialFocus = 'popup';

            return popup.open('#filterIncident');
          },
          display: 'icons',
          label: 'incidents filters',
          icons: 'oj-fwk-icon demo-icon-font-24 demo-filter-icon',
          visible: self.showFilterBtn
        }
      }
    }
  }

  return incidentsViewModel;
});
