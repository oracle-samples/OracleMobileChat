/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
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
