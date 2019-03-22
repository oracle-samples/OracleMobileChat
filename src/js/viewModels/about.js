/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'appController',
        'ojs/ojknockout',
        'ojs/ojpopup'],
  function(oj, ko, $, app) {

    function aboutViewModel() {
      var self = this;

      var aboutContent = [{id: 'aboutDemo', title: '', label: 'About Demo' },
                          {id: 'privacyPolicy', title: 'Oracle Privacy Policy', label: 'Oracle Privacy Policy' }];

      self.handleActivated = function(params) {

        var parentRouter = params.valueAccessor().params['ojRouter']['parentRouter'];

        // add aboutList as default state on child router
        var routerConfigOptions = {
          'aboutList': { label: 'About', isDefault: true },
        };

        // add each about list item to the router
        aboutContent.forEach(function(item) {
          var id = item.id.toString();
          routerConfigOptions[id] = { label: item.title };
        });

        self.router = parentRouter.createChildRouter('about').configure(routerConfigOptions);

        var switcherCallback = function(context) {
          return app.pendingAnimationType;
        };

        // switch module based on router state
        self.moduleConfig = ko.pureComputed(function () {
          var moduleConfig;

          // pass the list content to the list view
          if(self.router.stateId() === 'aboutList') {
            moduleConfig = $.extend(true, {}, self.router.moduleConfig, {
              'params': { 'list': aboutContent },
              'animation': oj.ModuleAnimations.switcher(switcherCallback)
            });
          } else {
            // pass the list item content to the content view
            moduleConfig = $.extend(true, {}, self.router.moduleConfig, {
              'name': 'aboutContent',
              'params': { 'contentID': self.router.stateId() },
              'animation': oj.ModuleAnimations.switcher(switcherCallback)
            });
          }

          return moduleConfig;
        });

        return oj.Router.sync();
      };

      // dispose about page child router
      self.dispose = function(info) {
        self.router.dispose();
      };

      // handle go back
      self.goBack = function() {
        app.pendingAnimationType = 'navParent';
        window.history.back();
      };

      // navigate to about content
      self.optionChange = function(event) {
        var value = event.detail.value;
        if(value && value[0] !== null) {
          app.pendingAnimationType = 'navChild';
          self.router.go(value[0]);
        }
      };

      // open social links popup
      self.openPopup = function() {
        var popup = document.getElementById('aboutPopup');
        popup.position = {
          "my": {
            "horizontal": "center",
            "vertical": "top"
          },
          "at": {
            "horizontal": "center",
            "vertical": "top + 50"
          },
          "of": ".oj-hybrid-applayout-content",
          "offset": {
            "x": 0,
            "y": 30
          }
        };

        // place initial focus on the popup instead of the first focusable element
        popup.initialFocus = 'popup';

        return popup.open('#profile-action-btn');
      };

    }

    return aboutViewModel;

  });
