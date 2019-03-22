/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
// PushClient using PhoneGap notification plugin and serviceWorker

'use strict';

define(['jquery', 'dataService', 'appConfig'], function ($, data, appConfig) {

  function PushClient(app) {
    var self = this;

    var platforms = navigator.userAgent.match(/(iPhone|iPad|iPod|Android|MSAppHost)/i);
    self.platform = platforms ? platforms[0] : null;
    if(self.platform ) {
      if(self.platform.substring(0,1) == 'i'){
        self.platform = "IOS"
      } else if(self.platform && self.platform.substring(0,1) == 'A'){
        self.platform = "ANDROID"
      } else if(self.platform && self.platform.substring(0,1) == 'M'){
        self.platform = "WINDOWS"
      }
    }

    self.providers = {
      'IOS': 'APNS',
      'ANDROID': 'GCM',
      'WINDOWS': 'WNS',
      'WEB': 'SYNIVERSE'
    }

    _initPush();

    function _initPush() {
      // get notificationToken from serviceWorker registration
      if('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(registration) {
          registration.pushManager.subscribe({userVisibleOnly: true})
            .then(function (subscription) {
              self.notificationToken = subscription.endpoint.split('/').pop();
              // servicework uses GCM so set android as platform
              self.platform = 'ANDROID';
            })
            .catch(function (e) {
              if(Notification.permission === 'denied') {
                console.log('notification permission denied')
              } else {
                console.error(e);
              }
            })
        })
      }

      // initialise PushNotification plugin
      if(window.PushNotification) {
        self.push = PushNotification.init({
            "android": {
              senderID: appConfig.senderID,
              clearBadge: "true"
            },
            "browser": {
              pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
            "ios": {
              clearBadge: "true",
              alert: "true",
              badge: "true",
              sound: "true"
            },
            "windows": {}
          });
        self.push.on('registration', function (data) {
          // update regId
          self.notificationToken = data.registrationId;
        });
        self.push.on('notification', function (data) {
          // TODO go to incidents list on click

          // Set badge in nav drawer
          app.unreadIncidentsNum(data.count);

          // Set badge on app icon
          self.push.setApplicationIconBadgeNumber(function() {
          }, function() {
              console.error('Setting Badge Number Error');
          }, data.count);
        });
      }
    }

    // register notification with MCS backend
    self.registerForNotifications = function () {

      // TODO verify whether authentication is needed

      var registration = {
        'notificationToken': self.notificationToken,
        'mobileClient': {
          'id': appConfig.appId,
          'version': appConfig.appVersion,
          'platform': self.platform
        },
        'notificationProvider': self.providers[self.platform]
      }

      // uncomment the following after setting up the MCS backend and senderID in appConfigExternal.js
      // data.registerForNotifications(registration).then(function (response) {
      //   console.log('Registering Notifications Success: ', response);
      // }).fail(function (response) {
      //   console.error('Registering Notifications Fail: ', response);
      // })
    }

  }

  return PushClient;
})
