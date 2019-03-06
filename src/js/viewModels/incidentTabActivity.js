/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'dataService',
        'appController',
        'ojs/ojknockout',
        'ojs/ojlistview',
        'ojs/ojarraytabledatasource',
        'ojs/ojinputtext',
        'ojs/ojpulltorefresh',
        'ojs/ojjquery-hammer',
        'ojs/ojtoolbar'], function(oj, ko, $, data, app) {
  function activityViewModel(params) {

    var self = this;

    // retrieve incident id
    self.incidentId = params['ojRouter']['parentRouter']['parent'].currentState().id;

    self.scrollElem = document.body;

    self.allActivities = ko.observableArray([]);
    self.dataSource = new oj.ArrayTableDataSource(self.allActivities, { idAttribute: 'id' });

    function setupPullToRefresh() {
      oj.PullToRefreshUtils.setupPullToRefresh($('body')[0], function() {
        return getActivities();
      }, {
        'primaryText': 'Checking for new incidents…',
        'secondaryText': self.lastUpdate ? 'Last Updated at ' + new Date(self.lastUpdate).toUTCString() : '', 'threshold': 100
      });

      // adjust position for pull to refresh panel
      // adjust z-index to overlay on the padding of .oj-applayout-content
      // because .oj-hybrid-applayout-page now has white background
      var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
      var contentElems = document.getElementsByClassName('oj-pulltorefresh-panel');

      for(var i=0; i<contentElems.length; i++) {
        if (topElem) {
          contentElems[i].style.position = 'relative';
          contentElems[i].style.top = topElem.offsetHeight+'px';
          contentElems[i].style.zIndex = 100;
        }
      }
    }

    function getActivities() {
      // check for new activities
      return new Promise(function (resolve, reject) {
        data.getIncidentActivities(self.incidentId).then(function(response) {
          var data = JSON.parse(response);
          var results = data.activities;

          self.lastUpdate = data.lastUpdate;

          processActivities(results);
          setupPullToRefresh();

          resolve();
        }).catch(function (e) {
          reject(e);
        });
      });
    }

    function processActivities(results) {
      results.sort(function(a, b) {
        return (a.createdOn < b.createdOn) ? 1 : (a.createdOn > b.createdOn) ? -1 : 0;
      });

      self.allActivities(results);

      self.dataSource.reset();

      if(results.length === 0) {
        var activityListView = document.getElementById('activityListView');
        activityListView.translations.msgNoData = 'No Activity';
        activityListView.refresh();
      }
    }

    self.handleActivated = function (info) {
      // Return a promise to force waiting until it is resolved.
      // This avoids jank.
      return getActivities();
    }

    // adjust content padding top
    self.handleAttached = function(info) {
      app.appUtilities.adjustContentPadding();

      $('#upload-activity-pic').change({ imgHolder: self.imageSrc }, function(event) {
        app.photoOnChange(event);
      });

    };

    self.handleDeactivated = function(info) {
      var listView = document.getElementById('activityListView');
      oj.PullToRefreshUtils.tearDownPullToRefresh(listView);
    };

    app.refreshActivities = function (response) {
      var data = JSON.parse(response);
      var results = data.activities;
      self.lastUpdate = data.lastUpdate;

      processActivities(results);
    }

    self.textValue = ko.observable();
    self.imageSrc = ko.observable();

    // handler for photo change
    self.changePhoto = function() {

      if(!navigator.camera) {
        $('#upload-activity-pic').trigger('click');
      } else {
        return app.openBottomDrawer(self.imageSrc);
      }
    };

    // post to activity list
    self.postActivity = function(input, imageSrc) {

      var userProfile = ko.mapping.toJS(app.userProfileModel);

      var new_activity = {
        id: Math.floor(Date.now() / 1000),
        userId: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        role: userProfile.role,
        createdOn: new Date(Date.now()).toISOString(),
        picture: ''
      };

      if(input) {
        new_activity.comment = input;
        new_activity.picture = imageSrc;

        self.textValue('');
        self.imageSrc('');

        // reset file upload input
        $('#upload-activity-pic').val('');

        data.postIncidentActivity(self.incidentId, new_activity.comment, new_activity.picture).then(function(response){
          self.allActivities.unshift(JSON.parse(response));
        }).fail(function(response) {
          oj.Logger.error('Failed to post activity', response);
          app.connectionDrawer.showAfterUpdateMessage();
        });
      }
    };

  }

  return activityViewModel;
});
