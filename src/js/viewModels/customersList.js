/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'dataService',
        'appController'/*,
        'persist/persistenceStoreManager'*/,
        'ojs/ojknockout',
        'ojs/ojjsontreedatasource',
        'ojs/ojindexer',
        'ojs/ojanimation', 'ojs/ojselectcombobox'], function(oj, ko, $, data, app/*, persistenceStoreManager*/){
  function customersViewModel() {
    var self = this;

    self.handleActivated = function(params) {
      // retrieve parent router
      self.parentRouter = params.valueAccessor().params['ojRouter']['parentRouter'];

      app.refreshCustomers = function (response) {
        processCustomers(response);
      }
    };

    function processCustomers(response) {

      var result = JSON.parse(response).result;

      /*persistenceStoreManager.openStore('customers').then(function (store) {
        store.keys().then(function (keys) {
          result.forEach(function (customer) {
            if(keys.indexOf(customer.id) > -1) {
              customer.cached = true;
            } else {
              customer.cached = false;
            }
          })
*/

          /* SKD */
          result.forEach(function (customer) {
            customer.cached = true;
          });

          var formatted = [];
          var keys = [];

          // format data for indexer groups
          for(var i=0; i<result.length; i++) {
            var firstNameInitial = result[i].firstName.charAt(0).toUpperCase();
            if(keys.indexOf(firstNameInitial) > -1) {
              formatted[keys.indexOf(firstNameInitial)].children.push({attr: result[i]});
            } else {
              keys.push(firstNameInitial);
              formatted.push({
                attr: { id: firstNameInitial },
                children: [{attr: result[i]}]
              });
            }
          }

          // sort by firstName initial
          formatted.sort(function(a, b) {
            return (a.attr.id > b.attr.id) ? 1 : (a.attr.id < b.attr.id) ? -1 : 0;
          });

          // sort by firstName then lastName within each group
          formatted.forEach(function(group) {

            group.children.sort(function(a, b) {
              // sort by first name
              if (a.attr.firstName > b.attr.firstName) {
                return 1;
              } else if (a.attr.firstName < b.attr.firstName) {
                return -1;
              }

              // else sort by last name
              return (a.attr.lastName > b.attr.lastName) ? 1 : (a.attr.lastName < b.attr.lastName) ? -1 : 0;
            });
          });

          self.allCustomers(formatted);
        //});
      //})
    };

    self.handleBindingsApplied = function(info) {
      if (app.pendingAnimationType === 'navParent') {
        app.preDrill();
      }

      // Adjust content element positions
      // This should be done in handleBindingsApplied before animation starts.
      // Doing it in handleTransitionCompleted is too late because that's called
      // after animation ends and the new view will be blank during animation.
      var listView = document.getElementById('customerlistview');
      oj.Context.getContext(listView).getBusyContext().whenReady().then(function () {
          self.getIndexerModel();

          // adjust content padding top
          app.appUtilities.adjustContentPadding();

          // adjust padding-bottom for indexer
          var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
          var contentElem = document.getElementById('indexer').getElementsByTagName('ul')[0]; //document.getElementById('indexer');

          contentElem.style.paddingBottom = topElem.offsetHeight+'px';
          contentElem.style.position = 'fixed';
          contentElem.style.height = '100%';

      });
    };

    self.handleTransitionCompleted = function(info) {

      if (app.pendingAnimationType === 'navParent') {
        app.postDrill();
      }

      // invoke zoomIn animation on floating action button
      var animateOptions = { 'delay': 0, 'duration': '0.3s', 'timingFunction': 'ease-out' };
      oj.AnimationUtils['zoomIn']($('#addCustomer')[0], animateOptions);

    };

    self.scrollElem = document.body;

    self.allCustomers = ko.observableArray();
    self.nameSearchValue = ko.observableArray();
    self.nameSearchRawValue = ko.observable();
    self.noResults = ko.observable(false);

    self.indexerModel = ko.observable(null);

    self.itemOnly = function(context) {
      return context['leaf'];
    };

    self.selectTemplate = function(context) {
      var renderer = oj.KnockoutTemplateUtils.getRenderer(context.leaf ? 'item_template' : 'group_template', true);
      return renderer.call(this, context)
    };

    self.getIndexerModel = function() {
      if (self.indexerModel() == null) {
        var listView = document.getElementById('customerlistview');
        var indexerModel = listView.getIndexerModel();
        self.indexerModel(indexerModel);
      }
    };

    // load customers
    data.getCustomers().then(function(response) {
      processCustomers(response);
    });

    // filter customers
    self.customers = ko.computed(function() {

      if (self.nameSearchRawValue() && self.allCustomers().length > 0) {
        var filteredCustomers = [];

        var token = self.nameSearchRawValue().toLowerCase();

        self.allCustomers().forEach(function (node) {
          node.children.forEach(function (leaf) {
            if (leaf.attr.firstName.toLowerCase().indexOf(token) === 0 || leaf.attr.lastName.toLowerCase().indexOf(token) === 0) {
              filteredCustomers.push(leaf);
            }
          });
        });
        self.noResults(filteredCustomers.length == 0);
        return new oj.JsonTreeDataSource(filteredCustomers);

      } else {
        self.noResults(false);
        return new oj.JsonTreeDataSource(self.allCustomers());
      }

    });

    // go to create customer page
    self.goToAddCustomer = function() {
      self.parentRouter.go('customerCreate');
    };

    // handler for drill in to customer details
    self.optionChange = function(event) {
      var value = event.detail.value;
      if (value && value[0]) {
        app.pendingAnimationType = 'navChild';
        app.goToCustomer(value[0]);
      }
    };

    self.isSearchMode = ko.observable(false);

    self.goToSearchMode = function() {
      self.isSearchMode(true);
      $("#inputSearch").focus();
    };

    self.exitSearchMode = function() {
      self.isSearchMode(false);
      self.clearSearch();
    };

    self.clearSearch = function() {
      self.nameSearchValue([]);
    };

	}

  return customersViewModel;

});
