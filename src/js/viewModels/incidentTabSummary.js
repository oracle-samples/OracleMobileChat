/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['jquery', 'appController', 'ojs/ojknockout', 'ojs/ojlistview'], function($, app) {
  function summaryViewModel() {
    var self = this;

    // adjust content padding top
    self.handleAttached = function(info) {
      // If the view is retrieved from cache, then DOM is already available.
      // Do the adjustment immediately to avoid jank.
      if (info.fromCache) {
        app.appUtilities.adjustContentPadding();
      }
    };

    self.handleBindingsApplied = function(info) {
      // When the view is rendering first time then DOM is already available.
      // Do the padding adjustment here to avoid jank
      app.appUtilities.adjustContentPadding();
      if (app.pendingAnimationType === 'navParent' || app.pendingAnimationType === 'navChild') {
        app.preDrill();
      }
    };

    self.handleTransitionCompleted = function(info) {
      if (app.pendingAnimationType === 'navParent' || app.pendingAnimationType === 'navChild') {
        app.postDrill();
      }
    };

    // trigger click when selection changes
    self.optionChange = function (event) {
      var detail = event.detail;
      if(detail.items[0]) {
        $(detail.items[0]).trigger('click');
      }
    };

  }

  return summaryViewModel;
});
