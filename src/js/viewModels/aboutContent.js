/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['appController'], function(app) {

  function aboutContentVM(params) {
    var self = this;

    // retrieve contentId to render template
    self.contentID = params.contentID;

    self.handleBindingsApplied = function(info) {
      if (app.pendingAnimationType === 'navChild') {
        app.preDrill();
      }
    };

    self.handleTransitionCompleted = function(info) {  
      // adjust content padding
      if(self.contentID !== 'aboutDemo') {
        app.appUtilities.adjustContentPadding();
      }

      if (app.pendingAnimationType === 'navChild') {
        app.postDrill();
      }

    };

  }

  return aboutContentVM;
});
