/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/

// Tour page viewModel holding the tour launch page and tour content

'use strict';
define(['knockout', 'jquery', 'ojs/ojknockout'], function(ko, $) {
  function tourViewModel() {
    var self = this;
    self.tourPage = ko.observable('tourLaunchPage');

    self.step = ko.observable(0);

    self.skipOrSignIn = ko.computed(function() {
      if(self.step() === 3) {
        return 'Sign In';
      }
      return 'Skip';
    });

    self.startTour = function() {
      self.tourPage('tourContent');
    };

    self.filmStripOptionChange = function(event) {
      self.step(event.detail.value['index']);
    };
    
  }
  return tourViewModel;
});
