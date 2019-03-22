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
        'ojs/ojarraytabledatasource',
        'ojs/ojradioset'],
function(oj, ko, $, app) {
  function statusViewModel() {
    var self = this;

    // adjust content padding for fixed top region
    self.handleAttached = function(info) {
      app.appUtilities.adjustContentPadding();
    };

    self.handleBindingsApplied = function(info) {
      if (app.pendingAnimationType === 'navChild') {
        app.preDrill();
      }
    };

    self.handleTransitionCompleted = function(info) { 
      if (app.pendingAnimationType === 'navChild') {
        app.postDrill();
      }
    };

    var statusOptionsArr = [{'id': 'open', 'title': 'Open'},
                            {'id': 'accepted', 'title': 'Accepted'},
                            {'id': 'closed', 'title': 'Closed'}];

    self.statusOptions = ko.observableArray();
    self.statusOptions(new oj.ArrayTableDataSource(statusOptionsArr, {idAttribute: 'id'}));

  }

  return statusViewModel;
});
