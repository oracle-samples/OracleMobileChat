/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
 // incidents list view viewModel
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'dataService',
        'appController',
        //'persist/persistenceStoreManager',
        /*'ojs/ojknockout',
        'ojs/ojoffcanvas',
        'ojs/ojlistview',*/
        'ojs/ojswipetoreveal',/*
        'ojs/ojjquery-hammer',
        //'promise',
        */'ojs/ojpulltorefresh',
        'ojs/ojmodel',
        'ojs/ojcheckboxset',
        'ojs/ojarraytabledatasource'/*,
        'ojs/ojpopup',
        'ojs/ojanimation'*/],
function(oj, ko, $, data, app/*, persistenceStoreManager*/) {
  function tablistViewModel(params) {

    var self = this;

    function setupPullToRefresh() {
      oj.PullToRefreshUtils.setupPullToRefresh($('body')[0], function() {
        return new Promise(function(resolve, reject) {
          // check for new incidents
          data.getIncidents().then(function(response) {
            var incidentsData = JSON.parse(response);
            processIncidentsData(incidentsData);
            resolve();
          }).fail(function(response){
            // TODO
            reject();
          });
        });
        // TODO fix refresh issue on transition
      }, {
        'primaryText': 'Checking for new incidents…',
        'secondaryText': self.lastUpdate ? 'Last Updated at ' + (new Date(self.lastUpdate)).toUTCString() : '', 'threshold': 100
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

    // load incidents on activation
    self.handleActivated = function(params) {

      app.refreshIncidents = function (response) {
        var incidentsData = JSON.parse(response);
        processIncidentsData(incidentsData);
      };

      return new Promise(function(resolve, reject){
        self.incidentsPromise = data.getIncidents();
        self.incidentsPromise.then(function(response) {
          var incidentsData = JSON.parse(response);
          processIncidentsData(incidentsData, resolve);
        });

        var listView = document.getElementById('incidentsListView');
        oj.Context.getContext(listView).getBusyContext().whenReady().then(function () {
            setupPullToRefresh();
        });
      });

    };

    self.handleBindingsApplied = function(info) {
      if (app.pendingAnimationType === 'navParent') {
        app.preDrill();
      }
      app.appUtilities.adjustContentPadding();
    };

    self.handleTransitionCompleted = function(info) {
      if (app.pendingAnimationType === 'navParent') {
        app.postDrill();
      }
    };

    self.dispose = function (info) {
      // Store scroll position
      localStorage.setItem("incidents-scroll-top",  self.scrollTop());
    }

    function processIncidentsData(incidentsData, resolve) {

      self.lastUpdate = incidentsData.lastUpdate;

      var unreadIncidentsNum = 0;

      incidentsData.result.forEach(function(incident){
        incident.statusObservable = ko.observable(incident.status);
        if(!incident.read)
          unreadIncidentsNum++;
        //SKD
        incident.cached = true;
      });

      app.unreadIncidentsNum(unreadIncidentsNum);

      incidentsData.result.sort(function(a, b) {
        return (a.createdOn < b.createdOn) ? 1 : (a.createdOn > b.createdOn) ? -1 : 0;
      });
/*
      persistenceStoreManager.openStore('incidents').then(function (store) {
        store.keys().then(function (keys) {
          incidentsData.result.forEach(function (incident) {
            incident.cached = false;
            keys.forEach(function (key) {
              if(key.indexOf(incident.id) > -1) {
                incident.cached = true
              }
            })

          })
*/
          self.allIncidents = incidentsData.result;

          var results = self.filterIncidents();

          // show message when no data is available.
          if(results.length === 0) {
            document.getElementById("incidentsListView").translations.msgNoData = "new message";
          }

          // update observable
          self.filteredIncidents(results);
          // trigger listview to reload (skipping model change event animation)
          self.incidentsTableData.reset();

          var listView = document.getElementById('incidentsListView');
          oj.Context.getContext(listView).getBusyContext().whenReady().then(function () {
            self.setupSwipeActions();
          });
          resolve();
        //})
      //})
    }

    self.scrollElem = navigator.userAgent.search(/Firefox|Trident|Edge/g)  > -1 ? document.body.parentElement : document.body;
    self.scrollTop = ko.observable(0);

    self.priorityFilterArr = ko.observable(['high', 'normal', 'low']);
    self.statusFilterArr = ko.observable(['open', 'accepted', 'closed']);

    self.allIncidents = [];

    self.filteredIncidents = ko.observableArray([]);
    self.incidentsTableData = new oj.ArrayTableDataSource(self.filteredIncidents, { idAttribute: 'id' });

    self.filterIncidents = function() {
      return self.allIncidents.filter(function(incident) {
        return self.priorityFilterArr().indexOf(incident.priority) > -1 && self.statusFilterArr().indexOf(incident.statusObservable()) > -1;
      });
    };

    // update incidents list when priority or status filter changes
    self.priorityFilterArr.subscribe(function(newValue) {
      var filteredResults = self.filterIncidents();
      self.filteredIncidents(filteredResults);
    });

    self.statusFilterArr.subscribe(function(newValue) {
      var filteredResults = self.filterIncidents();
      self.filteredIncidents(filteredResults);
    });

    self.selectHandler = function(event) {
      var value = event.detail.value;
      if(value && value[0]) {
        event.preventDefault();

        // todo investigate pull-to-refresh and android drill in/out animation
        app.pendingAnimationType = 'navChild';
        app.goToIncident(value[0], 'tablist');
        oj.PullToRefreshUtils.tearDownPullToRefresh('body');
      }
    };

    self.goToAddIncident = function() {
      app.goToCreateIncident();
    };

    self.setupSwipeActions = function() {
      // register swipe to reveal for all new list items
      $("#incidentsListView").find(".demo-item-marker").each(function(index) {
        var id = $(this).prop("id");
        var startOffcanvas = $(this).find(".oj-offcanvas-start").first();
        var endOffcanvas = $(this).find(".oj-offcanvas-end").first();

        // setup swipe actions
        oj.SwipeToRevealUtils.setupSwipeActions(startOffcanvas);
        oj.SwipeToRevealUtils.setupSwipeActions(endOffcanvas);

        // make sure listener only registered once
        endOffcanvas.off("ojdefaultaction");
        endOffcanvas.on("ojdefaultaction", function() {
          // No default action
        });
      });

      // Restore scroll position
      self.scrollTop(localStorage.getItem("incidents-scroll-top"));
    };


    self.handleDetached = function(info) {
      // un-register swipe to reveal for all list items
      $("#incidentsListView").find(".demo-item-marker").each(function(index) {
        var startOffcanvas = $(this).find(".oj-offcanvas-start").first();
        var endOffcanvas = $(this).find(".oj-offcanvas-end").first();

        oj.SwipeToRevealUtils.tearDownSwipeActions(startOffcanvas);
        oj.SwipeToRevealUtils.tearDownSwipeActions(endOffcanvas);
      });
    };

    self.handleDeactivated = function(info) {
      oj.PullToRefreshUtils.tearDownPullToRefresh('body');
    };

    self.closeToolbar = function(which, item) {
      var toolbarId = "#"+which+"_toolbar_"+item.prop("id");
      var drawer = {"displayMode": "push", "selector": toolbarId};

      oj.OffcanvasUtils.close(drawer);
    };

    self.handleAction = function(which, action, model) {

      if (model !== null && model.id) {
        // offcanvas won't be open for default action case
        if (action != "default") {
          self.closeToolbar(which, $(model));
        }

        var index = self.allIncidents.map(function(e) { return e.id; }).indexOf(model.id);
        self.allIncidents[index].statusObservable(action);

        data.updateIncident(model.id, {status: action}).then(function(response) {
          // update success
          // re-apply filter to incidents after changing status
          self.filterIncidents();
        }).fail(function(response){
          oj.Logger.error('Failed to update incident.', response)
          app.connectionDrawer.showAfterUpdateMessage();
        });

      } else {
        id = document.getElementById('incidentsListView').currentItem;
      }
    };

    self._handleAccept = function(model) {
      self.handleAction('second', 'accepted', model);
    };

    self._handleOpen = function(model) {
      self.handleAction('second', 'open', model);
    };

    self._handleReturn = function(model) {
      self.handleAction('second', 'open', model);
    };

    self._handleTrash = function(model) {
      self.handleAction('second', 'closed', model);
    };

    self._handleOKCancel = function() {
      $("#modalDialog1").ojDialog("close");
    };

    self.removeModel = function(model) {
      self.allIncidents.remove(function(item) {
        return (item.id == model.id);
      });
    };

  }

  return tablistViewModel;

});
