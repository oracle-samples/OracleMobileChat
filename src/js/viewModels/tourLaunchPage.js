/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojcore', 'jquery', 'ojs/ojbutton', 'ojs/ojanimation'], function(oj, $) {
	function tourViewModel() {
		var self = this;

    self.handleTransitionCompleted = function(info) { 
      // hide cordova splash screen
      if(navigator.splashscreen) {
        navigator.splashscreen.hide();
      }

      // invoke slideIn animation
      var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
      oj.AnimationUtils['slideIn']($('.demo-tour-launch-action')[0], animateOptions);
    };

  }

  return tourViewModel;
});
