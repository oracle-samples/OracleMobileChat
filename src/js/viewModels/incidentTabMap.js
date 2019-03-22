/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'dataService',
        'ojs/ojknockout'], function(oj, ko, $, data) {
  function mapViewModel(params) {

    var self = this;

    self.handleTransitionCompleted = function() {
      // adjust padding for details panel
      var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];

      if (topElem) {
        $('#detailsPanel').css('padding-top', topElem.offsetHeight+'px');
      }

      // dismiss details panel when click on map
      $('#map').on('click touchstart', function() {
        $('#detailsPanel').slideUp();
      })

    }

    // retrieve location id
    self.locationId = params.locationId;

    self.locationData = ko.observable();

    // load incident location data
    function getLocationData(id) {
      data.getLocation(id).then(function(response) {
        var result = JSON.parse(response);
        self.map().incidentLocation({
          lat: result.latitude,
          lng: result.longitude
        });
      });
    }

    if(self.locationId()) {
      getLocationData(self.locationId());
    }

    self.locationId.subscribe(function(newValue) {
      if(newValue) {
        getLocationData(newValue);
      }
    });

    self.map = ko.observable({
      incidentLocation: ko.observable(),
      userLocation: ko.observable()
    });

    var browserSupportFlag;

    // Try W3C Geolocation (Preferred)
    if(navigator.geolocation) {
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        self.map().userLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, function() {
        self._handleNoGeolocation(browserSupportFlag);
      });
    }
    // Browser doesn't support Geolocation
    else {
      browserSupportFlag = false;
      self._handleNoGeolocation(browserSupportFlag);
    }

    self._handleNoGeolocation = function(errorFlag) {
      if (errorFlag === true) {
        oj.Logger.error("Geolocation service failed.");
      } else {
        oj.Logger.error("Browser doesn't support geolocation");
      }
    };
    ko.bindingHandlers.incidentMap = {
      init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

    };
    self.duration = ko.observable();
    self.distance = ko.observable();

    self.showDetails = function() {
      $("#detailsPanel").slideToggle();
    };

  }

  return mapViewModel;
});
