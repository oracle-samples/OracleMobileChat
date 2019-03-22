/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojinputtext'], function() {
  function createIncidentSummaryViewModel() {
    var self = this;

    var categoryDic = {'appliance': 'Appliance', 'electrical': 'Electrical', 'heatingcooling': 'Heating / Cooling', 'plumbing': 'Plumbing', 'general': 'General'};

    self.categoryLabel = function(categoryID) {
      return categoryDic[categoryID];
    };

    self.priorityLabel = function(priorityID) {
      return priorityID.charAt(0).toUpperCase() + priorityID.slice(1);
    };

  }

  return createIncidentSummaryViewModel;

});
