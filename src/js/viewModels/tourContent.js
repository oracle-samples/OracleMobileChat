/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/

 // view model for the tour content with filmstrip
'use strict';
define(['knockout', 'jquery', 'ojs/ojfilmstrip', 'ojs/ojpagingcontrol'], function(ko, $) {
  function tourContentViewModel() {
    var self = this;
    
    self.pagingModel = ko.observable(null);
    
    // todo: need to fix the animation so that the paging model is set before the transition occurs
    self.handleAttached = function() {
      var filmStrip = document.getElementById("filmStrip");
      oj.Context.getContext(filmStrip).getBusyContext().whenReady().then(function () {
        self.pagingModel(filmStrip.getPagingModel());
      });
    }
    
    self.steps = [
      {
        'title': 'dashboard',
        'description': 'Review a dashboard of your current incidents.',
        'imgSrc': 'css/images/dashboard_image@2x.png',
        'color': '#4493cd'
      },
      {
        'title': 'maps',
        'description': 'Find locations and directions to your customers.',
        'imgSrc': 'css/images/maps_image@2x.png',
        'color': '#FFD603'
      },
      {
        'title': 'incidents',
        'description': 'Check on details about the incident including seeing feed updates and photos.',
        'imgSrc': 'css/images/incidents_image@2x.png',
        'color': '#E5003E'
      },
      {
        'title': 'customers',
        'description': 'Have your customers information easily available.',
        'imgSrc': 'css/images/customers_image@2x.png',
        'color': '#009636'
      }
    ];

    self.getItemInitialDisplay = function(index) {
      return index < 1 ? '' : 'none';
    };

  }
  return tourContentViewModel;
});
