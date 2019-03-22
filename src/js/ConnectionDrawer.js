/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
define(['ojs/ojcore', 'jquery', 'knockout'], function (oj, $, ko) {
  function connectionMessageViewModel(app) {
    var self = this;

    // connection change event
    // cordova-plugin-network-information plugin is needed for hybrid app
    if (typeof Connection != "undefined") {
      document.addEventListener('online',  onlineHandler);
      document.addEventListener('offline', offlineHandler);
    } else {
      // add online and offline event handler for web app
      window.addEventListener('online',  onlineHandler);
      window.addEventListener('offline', offlineHandler);
    }


    var MESSAGES = {
      'online': 'You are connected to network.',
      'offline': 'You are not connected to network.'
    };

    self.online = ko.observable(true);
    self.message = ko.observable()

    var currentTimer;
    var syncIsPending = false;

    // toggle between primary message and secondary message
    self.toggleMessageContent = function(firstText, secondText) {
      self.message(firstText);
      currentTimer = window.setTimeout(function () {
        self.message(secondText);
        self.toggleMessageContent(secondText, firstText);
      }, 2000)
    }


    function onlineHandler() {
      if(self.online()) {
        return;
      }
      
      document.body.classList.remove('offline');

      self.online(true);
      self.message(MESSAGES['online']);
      self.openDrawer();

      // check if there is unsynced requests
      app.offlineController.getSyncLog().then(function (value) {
        if(value.length > 0 && !syncIsPending) {
          syncIsPending = true;
          app.offlineController.sync().then(function () {
            syncIsPending = false;
            self.openDrawer('Your updates have been applied.');
          }).catch(function (e) {
            syncIsPending = false;
            if(e.request != null) {
              self.openDrawer('Failed to sync your updates.');
            }
          });
        } 
      });

    }

    function offlineHandler() {
      if(!self.online()) {
        return;
      }
      
      document.body.classList.add('offline');

      self.online(false);
      self.message(MESSAGES['offline']);
      clearTimeout(currentTimer);

      var state = oj.Router.rootInstance.currentState().id;
      if(state === 'incidents' || state === 'createIncident')
        return self.openDrawer('You can create/edit incidents offline.')
      if(state === 'customers')
        return self.openDrawer('You can create/edit customers offline.')
      if(state === 'profile')
        return self.openDrawer('You can edit profile offline.')

      return self.openDrawer();

    }

    self.openDrawer = function (secondMessage) {
      oj.OffcanvasUtils.open({selector: '#connectionDrawer', modality: 'modaless', displayMode: 'overlay', content: '#pageContent' });
      clearTimeout(currentTimer);

      if(secondMessage)
        self.toggleMessageContent(self.message(), secondMessage)
    }

    self.showAfterUpdateMessage = function () {
      var state = oj.Router.rootInstance.currentState().id;
      self.message('Updates will be applied when online.');
      self.openDrawer();
    }

    self.closeDrawer = function () {
      oj.OffcanvasUtils.close({selector: '#connectionDrawer' });
    };

    // clear timer when drawer is dismissed
    $("#connectionDrawer").on("ojclose", function(event, offcanvas) {
      clearTimeout(currentTimer);
    });

  }
  return connectionMessageViewModel;
})
