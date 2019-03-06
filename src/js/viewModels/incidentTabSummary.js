/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
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
