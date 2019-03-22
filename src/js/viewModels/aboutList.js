/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojcore',
        'appController',
        'ojs/ojlistview',
        'ojs/ojarraytabledatasource',
        'ojs/ojknockout'],
  function(oj, app) {
    function aboutListViewModel(params) {
      var self = this;

      // retrieve about items to render the list
      self.aboutOptions = new oj.ArrayTableDataSource(params.list, {idAttribute: 'id'});

      self.handleActivated = function() {
        var contentElem = document.getElementsByClassName('oj-applayout-content')[0];
        contentElem.style.paddingTop = 0;
      }

      self.handleBindingsApplied = function(info) {
        if (app.pendingAnimationType === 'navParent') {
          app.preDrill();
        }
      };

      self.handleTransitionCompleted = function(info) {
        if (app.pendingAnimationType === 'navParent') {
          app.postDrill();
        }
      };

    }
    return aboutListViewModel;
  });
