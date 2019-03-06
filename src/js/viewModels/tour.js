/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
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
