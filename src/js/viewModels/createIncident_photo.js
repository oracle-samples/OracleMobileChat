/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojcore', 'jquery', 'appController'], function(oj, $, app) {
  function createIncidentPhotoViewModel() {
    var self = this;

    self.handleAttached = function(info) {
      // retrieve img observable from newIncidentDataModel
      self.img = info.valueAccessor().params['ojRouter']['parentRouter'].currentValue().img;

      // bind photoOnChange event to input and pass img to it
      $('#upload-incident-pic').change({ imgHolder: self.img }, function(event) {
        app.photoOnChange(event);
      });
    };

    self.attachPhoto = function() {

      if(!navigator.camera) {
        return $('#upload-incident-pic').trigger('click');
      } else {
        return app.openBottomDrawer(self.img, true);
      }
    };

  }

  return createIncidentPhotoViewModel;

});
