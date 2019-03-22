/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/

 // signin page viewModel
 // In a real app, replace it with your authentication and logic
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'appController',
        'ojs/ojrouter',
        'ojs/ojknockout',
        'ojs/ojcheckboxset',
        'ojs/ojinputtext',
        'ojs/ojbutton',
        'ojs/ojanimation'], function(oj, ko, $, app) {
  function signinViewModel() {
    var self = this;

    self.handleTransitionCompleted = function(info) {
      var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
      oj.AnimationUtils['fadeIn']($('.demo-signin-bg')[0], animateOptions);
    }

    // Replace with state save logic for rememberUserName
    self.userName = ko.observable('Harry Carson');
    self.passWord = ko.observable('password');
    self.rememberUserName = ko.observable(['remember']);

    // Replace with sign in authentication
    self.signIn = function() {
      app.getUserProfile(self.userName());
      app.pushClient.registerForNotifications();
      oj.Router.rootInstance.go('incidents/tabdashboard');
    };

  }
  return signinViewModel;
});
