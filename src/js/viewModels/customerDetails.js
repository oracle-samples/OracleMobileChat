/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'dataService',
        'appController',
        'mapping',
        'ojs/ojknockout',
        'ojs/ojinputtext'],
function(oj, ko, $, data, app, mapping) {

  function custDetailsViewModel() {
    var self = this;

    app.refreshCustomer = function (response) {
      self.customerData = JSON.parse(response);
      if(self.customerData) {
        self.customerModel(ko.mapping.fromJS(self.customerData));
        self.initialData = self.customerData;
      }
    }

    self.handleActivated = function(params) {

      self.parentRouter = params.valueAccessor().params['ojRouter']['parentRouter'];

      self.router = self.parentRouter.createChildRouter('customer').configure(function(stateId) {

        if(stateId) {

          var state = new oj.RouterState(stateId, { value: stateId,
            // Use "canEnter" instead of "enter" because we want to refresh
            // customerData before changing view.  Otherwise, the details view
            // will be changed during or after animation.
            canEnter: function() {
              // load customer data
              return data.getCustomer(stateId).then(function(response) {
                self.customerData = JSON.parse(response);

                if(self.customerData) {
                  self.customerModel(ko.mapping.fromJS(self.customerData));
                  self.initialData = self.customerData;
                }

                return true;
              });
            }
          });

          return state;
        }

      });

      return oj.Router.sync();
    };

    self.handleBindingsApplied = function(info) {
      if (app.pendingAnimationType === 'navChild') {
        app.preDrill();
      }

      // adjust content padding
      // This should be done in handleBindingsApplied before animation starts.
      // Doing it in handleTransitionCompleted is too late because that's called
      // after animation ends and the new view will be blank during animation.
      app.appUtilities.adjustContentPadding();
    };

    self.handleAttached = function () {

      $('#upload-customer-pic').change({ imgHolder: self.imgSrc }, function(event) {
        app.photoOnChange(event);
      });
    }

    self.handleTransitionCompleted = function(info) {
      if (app.pendingAnimationType === 'navChild') {
        app.postDrill();
      }
    };

    self.dispose = function(info) {
      self.router.dispose();
    };

    ko.mapping = mapping;

    self.editMode = ko.observable(false);
    self.imgSrc = ko.observable();
    self.customerModel = ko.observable();

    // update customer data
    // TODO update customer photo
    self.updateCustomerData = function() {
      self.initialData = ko.mapping.toJS(self.customerModel);

      var id = self.router.stateId();
      data.updateCustomer(id, self.initialData).then(function(response){
        // update customer success
      }).fail(function(response) {
        oj.Logger.error('Failed to update customer.', response);
        app.connectionDrawer.showAfterUpdateMessage();
      });
    };

    // revert changes to customer
    self.revertCustomerData = function() {
      self.customerModel(ko.mapping.fromJS(self.initialData));
    };

    // handler for photo change
    self.changePhoto = function() {
      if(!navigator.camera) {
        return $('#upload-customer-pic').trigger('click');
      } else {
        return app.openBottomDrawer(self.imgSrc);
      }
    };

    var leftClickAction = function() {
      if(self.editMode()) {
        self.revertCustomerData();
        self.editMode(false);
      } else {
        app.pendingAnimationType = 'navParent';
        window.history.back();
      }
    };

    var rightClickAction = function() {
      if(self.editMode()) {
        self.updateCustomerData();
        self.editMode(false);
      } else {
        self.editMode(true);
      }
    };

    var rightBtnLabel = ko.computed(function() {
      if(self.editMode()) {
        return 'Save';
      } else {
        return 'Edit';
      }
    });

    var leftBtnLabel = ko.computed(function() {
      if(self.editMode()) {
        return 'Cancel';
      } else {
        return 'Back';
      }
    });

    // customer details page header
    self.custDetailsHeaderSettings = {
      name:'basicHeader',
      params: {
        title: 'Customer',
        startBtn: {
          id: 'backBtn',
          click: leftClickAction,
          display: 'icons',
          label: leftBtnLabel,
          icons: 'oj-hybrid-applayout-header-icon-back oj-fwk-icon',
          visible: true
        },
        endBtn: {
          id: 'nextBtn',
          click: rightClickAction,
          display: 'all',
          label: rightBtnLabel,
          icons: '',
          visible: true,
          disabled: app.isReadOnlyMode ? self.editMode : false
        }
      }
    };

    // check if cordova contacts plugin is supported
    self.contactsPluginSupported = function() {
      if(navigator.contacts) {
        return true;
      } else {
        return false;
      }
    };

    // add custoemr to device contacts
    self.addToContacts = function() {

      var onSuccess = function(contacts) {
        // if customer doesn't exist in contacts, create a new contact
        if(!contacts.length) {

          var saveSuccess = function(contact) {
            // TODO
            // save success
            self._openContact(contact.id);

          };

          var saveError = function(contactError) {
            oj.Logger.error('Failed to save to contacts.', contactError)
          };

          var newContact = navigator.contacts.create();

          var contact = ko.mapping.toJS(self.customerModel);

          newContact.displayName = contact.firstName + ' ' + contact.lastName;
          newContact.nickname = contact.firstName;

          var name = new ContactName();
          name.givenName = contact.firstName;
          name.familyName = contact.lastName;
          name.formatted = newContact.displayName;
          newContact.name = name;

          var phoneNumbers = [];
          phoneNumbers[0] = new ContactField('mobile', contact.mobile, false);
          phoneNumbers[1] = new ContactField('home', contact.home, false);
          newContact.phoneNumbers = phoneNumbers;

          var emails = [];
          emails[0] = new ContactField('work', contact.email);
          newContact.emails = emails;

          var addresses = [];
          addresses[0] = new ContactAddress();
          addresses[0].type = 'work';
          addresses[0].formattedAddress = contact.address.formatted;
          addresses[0].streetAddress = (contact.address.street1 + ' ' + contact.address.street2).trim();
          addresses[0].locality = contact.address.city;
          addresses[0].region = contact.address.state;
          addresses[0].postalCode = contact.address.zip;
          addresses[0].country = contact.address.country;
          newContact.addresses = addresses;

          newContact.save(saveSuccess, saveError);

        } else {
          // TODO
          // handle contacts already exists
          self._openContact(contacts[0].id);
        }

      };

      var onError = function(contactError) {
        oj.Logger.error('Failed to find contacts.', contactError);
      };

      // look for existing contacts
      var options      = new ContactFindOptions();
      options.filter   = self.customerModel().firstName() + ' ' + self.customerModel().lastName();
      options.multiple = true;
      options.desiredFields = [navigator.contacts.fieldType.id];
      options.hasPhoneNumber = true;
      var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
      navigator.contacts.find(fields, onSuccess, onError, options);

    };


    self._openContact = function(id) {

      var successCallback = function() {
        oj.Logger.info('multiwindow success');
      };

      var errorCallback = function(msg) {
        oj.Logger.error(msg);
      };

      try{
        samsung.multiwindow.isSupported("freestyle", function(){

          var inputOptions = {};
          inputOptions.windowType = 'freestyle';
          inputOptions.action = "action_view";
          inputOptions.scaleInfo = 80;
          inputOptions.dataUri = "content://contacts/people/" + id;

          samsung.multiwindow.createMultiWindow(inputOptions, successCallback, errorCallback);

        }, function(){
          oj.Logger.error('no Samsung Multiwindow plugin');
        });
      } catch(e) {
        oj.Logger.error(e);
      }
    };
  }

  return custDetailsViewModel;

});
