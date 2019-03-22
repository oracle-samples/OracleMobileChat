/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
// offlineController

'use strict';

define(['appConfig', 'persist/persistenceStoreManager', 'persist/pouchDBPersistenceStoreFactory',
        'persist/persistenceManager', 'persist/simpleJsonShredding', 'persist/persistenceUtils',
        'persist/defaultResponseProxy', 'persist/fetchStrategies'],
  function (appConfig, persistenceStoreManager, pouchDBPersistenceStoreFactory,
    persistenceManager, simpleJsonShredding, persistenceUtils, defaultResponseProxy,
    fetchStrategies) {


    function OfflineController(app) {
      var self =this;
      var MBEregex = new RegExp(appConfig.backendName + '/');

      var incidents_request
      var customers_request
      var incident_request
      var activity_request
      var profile_request

      var tempIncId = 500
      var tempCusId = 500

      persistenceStoreManager.registerDefaultStoreFactory(pouchDBPersistenceStoreFactory);

      function isServerResponseNew(request, serverResponse) {
        return new Promise(function (resolve, reject) {
          persistenceManager.getCache()
            .match(request).then(function (cachedResponse) {
              var serverResPromise = persistenceUtils.responseToJSON(serverResponse);

              // if cached response found in cache
              // compare revNum and decide refreshing UI or not
              if(cachedResponse) {
                var cachedResPromise = persistenceUtils.responseToJSON(cachedResponse);

                Promise.all([cachedResPromise, serverResPromise]).then(function (results) {

                  var cachedRes = JSON.parse(results[0].body.text);
                  var serverRes = JSON.parse(results[1].body.text);

                  resolve(cachedRes.revNum < serverRes.revNum);
                });
              } else {
                resolve(true);
              }
            });
        })
      }

      function addTimeStamp(request, response) {
        // Add timestamp to it if not cached
        return new Promise(function (resolve, reject) {

          if(!persistenceUtils.isCachedResponse(response)) {
            persistenceUtils.responseToJSON(response).then(function (result) {
              if(result.status === 200) {
                var data = JSON.parse(result.body.text);
                data['lastUpdate'] = Date.now();
                persistenceUtils.setResponsePayload(response, data)
                  .then(function (updatedResponse) {
                    persistenceManager.getCache().put(request, updatedResponse.clone())
                      .then(function () {
                        resolve(updatedResponse);
                      });
                  });
              } else {
                resolve(response);
              }
            });
          } else {
            resolve(response);
          }
        });
      }

      var handleOfflineEdit = function(request) {
        if (!persistenceManager.isOnline()) {
          var init = {'status': 503, 'statusText': 'Edit will be processed when online'};
          return Promise.resolve(new Response(null, init));
        } else {
          return persistenceManager.browserFetch(request);
        }
      };

      var defaultIncidentsResponseProxy = defaultResponseProxy.getResponseProxy({
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              addTimeStamp(request, response);
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshIncidents(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              });
            })
          }
        }),
        requestHandlerOverride: {
          handlePost: function (request) {
            if (!persistenceManager.isOnline()) {

              persistenceUtils.requestToJSON(request).then(function (data) {
                // construct incident
                var incident = Object.assign(JSON.parse(data.body.text),
                {
                  "id": 'inc-' + tempIncId++,
                  "status": "open",
                  "createdOn": (new Date(Date.now())).toISOString(),
                  "lastUpdatedOn": "",
                  "_technicianUsername": "hcr",
                  "read": true,
                  "revNum": 0,
                  // TODO construct customer
                  "customer": {
                    "id": "cus-104",
                    "username": "lsmith",
                    "firstName": "Lynn",
                    "lastName": "Smith",
                    "locationId": "loc-4",
                    "mobile": "+16505067000",
                    "home": "+15105552121",
                    "email": "lsmith@somewhere.com",
                    "role": "Customer",
                    "revNum": 1
                  },
                  // TODO construct location
                  "location": {
                    "formattedAddress": "100 Park Street, Alameda, CA 94501 USA",
                    "latitude": "37.763389",
                    "longitude": "-122.243514",
                    "id": "loc-4",
                    "revNum": 1
                  }
                });

                // add this incident to incidents collection cache
                persistenceManager.getCache().match(incidents_request).then(function (response) {
                  persistenceUtils.responseToJSON(response).then(function (data) {
                    var incidents = JSON.parse(data.body.text)
                    incidents.result.push(incident);
                    incidents.count++;
                    persistenceUtils.setResponsePayload(response, incidents).then(function (response) {
                      persistenceManager.getCache().put(incidents_request, response);
                    })
                  })
                })

                // TODO add this incident detail to incident cache

                // TODO construct incident detail response

                // TODO create an empty incident activity cache

              })

              var init = {'status': 503, 'statusText': 'Edit will be processed when online'};
              return Promise.resolve(new Response(null, init));
            } else {
              return persistenceManager.browserFetch(request);
            }
          }
        }
      });

      var defaultIncidentResponseProxy = defaultResponseProxy.getResponseProxy({
        jsonProcessor: {
          shredder: simpleJsonShredding.getShredder('incidents', 'id'),
          unshredder: simpleJsonShredding.getUnshredder()
        },
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshIncident(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              });
            })

          }
        }),
        requestHandlerOverride: {
          handlePut: handleOfflineEdit
        }
      });

      // default strategy is getCacheIfOfflineStrategy
      var defaultActResponseProxy = defaultResponseProxy.getResponseProxy({
        fetchStrategy: fetchStrategies.getCacheIfOfflineStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function(resolve, reject) {
              addTimeStamp(request, response);
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  // refresh customer
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshActivities(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              });
            });


          }
        }),
        requestHandlerOverride: {
          handlePost: handleOfflineEdit
        }
      });

      var defaultCustomersResponseProxy = defaultResponseProxy.getResponseProxy({
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  // refresh customer
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshCustomers(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              })
            })

          }
        }),
        requestHandlerOverride: {
          handlePost: function (request) {
            if (!persistenceManager.isOnline()) {
              return new Promise(function (resolve, reject) {
                persistenceUtils.requestToJSON(request).then(function (data) {
                  var customer = Object.assign(
                    {
                      id: 'cus-' + tempCusId++,
                      firstName: null,
                      lastName: null,
                      mobile: null,
                      home: null,
                      email: null,
                      address: {
                        street1: null,
                        street2: null,
                        city: null,
                        state: null,
                        zip: null,
                        country: null
                      }
                    }, JSON.parse(data.body.text));

                  persistenceManager.getCache().match(customers_request).then(function (response) {
                    persistenceUtils.responseToJSON(response).then(function (data) {
                      var customers = JSON.parse(data.body.text)
                      customers.result.push(customer);
                      customers.count++;
                      persistenceUtils.setResponsePayload(response, customers).then(function (response) {
                        persistenceManager.getCache().put(customers_request, response).then(function () {
                          var init = {'status': 503, 'statusText': 'Edit will be processed when online'};
                          resolve(new Response(null, init));
                        });
                      })
                    })
                  })

                  // TODO create customer detail cache
                })
              })

            } else {
              return persistenceManager.browserFetch(request);
            }
          }
        }
      });

      var defaultCustomerResponseProxy = defaultResponseProxy.getResponseProxy({
        jsonProcessor: {
          shredder: simpleJsonShredding.getShredder('customers', 'id'),
          unshredder: simpleJsonShredding.getUnshredder()
        },
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  // refresh customer
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshCustomer(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              })
            })

          }
        }),
        requestHandlerOverride: {
          handlePatch: handleOfflineEdit
        }
      });

      var defaultStatsResponseProxy = defaultResponseProxy.getResponseProxy({
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshStats(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              });
            })

          }
        })
      });

      var defaultIncStatsResponseProxy = defaultResponseProxy.getResponseProxy({
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              isServerResponseNew(request, response).then(function (result) {
                if(result) {
                  persistenceUtils.responseToJSON(response).then(function (serverRes) {
                    app.refreshIncStats(serverRes.body.text);
                  });
                }
                resolve(response);
              }).catch(function (e) {
                reject(e);
              });
            })
          }
        })
      });

      var defaultProfileResponseProxy =  defaultResponseProxy.getResponseProxy({
        fetchStrategy: fetchStrategies.getCacheFirstStrategy({
          serverResponseCallback: function(request, response) {
            return new Promise(function (resolve, reject) {
              resolve(response);
            })
          }
        }),
        requestHandlerOverride: {
          handlePatch: function (request) {
            if (!persistenceManager.isOnline()) {

              persistenceUtils.requestToJSON(request).then(function (data) {
                var profile = JSON.parse(data.body.text);

                persistenceManager.getCache().match(profile_request).then(function (response) {
                  persistenceUtils.setResponsePayload(response, profile).then(function (response) {
                    persistenceManager.getCache().put(profile_request, response);
                  })
                })
              })

              var init = {'status': 503, 'statusText': 'Edit will be processed when online'};
              return Promise.resolve(new Response(null, init));
            } else {
              return persistenceManager.browserFetch(request);
            }
          }
        }
      });


      // var MBEregex = /fixitfastclient\//;

      persistenceManager.init().then(function(){
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /incidents(?!\/).*/.source)})
                          .then(function(registration) {
                            registration.addEventListener('fetch', function (event) {
                              if(!incidents_request)
                                incidents_request = event.request.clone();
                              event.respondWith(new Promise(function (resolve, reject) {
                                defaultIncidentsResponseProxy.processRequest(event.request.clone())
                                  .then(function (response) {
                                    resolve(addTimeStamp(event.request, response));
                                  });
                              }));
                            });
                          });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /incidents\/inc-\d{3}($|\?\_\=\d+)/.source) })
                          .then(function(registration){
                            registration.addEventListener('fetch',
                              defaultIncidentResponseProxy.getFetchEventListener()
                            );
                          });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /incidents\/inc-\d{3}\/activities$/.source) }).then(function(registration){
          registration.addEventListener('fetch', function (event) {
            event.respondWith(new Promise(function (resolve, reject) {
              defaultActResponseProxy.processRequest(event.request.clone())
                .then(function (response) {
                  resolve(addTimeStamp(event.request, response));
                }).catch(function (e) {
                  reject(e);
                });
            }))
          });
        });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /customers$/.source) }).then(function(registration){
          registration.addEventListener('fetch', function (event) {
            if(!customers_request)
              customers_request = event.request.clone();
            event.respondWith(defaultCustomersResponseProxy.getFetchEventListener()(event))
          });
        });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /customers\/cus-\d{3}$/.source) }).then(function(registration){
          registration.addEventListener('fetch', defaultCustomerResponseProxy.getFetchEventListener());
        });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /stats\?technician=/.source) }).then(function(registration){
          registration.addEventListener('fetch', defaultStatsResponseProxy.getFetchEventListener());
        });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /stats\/incidents\?technician=/.source) }).then(function(registration){
          registration.addEventListener('fetch', defaultIncStatsResponseProxy.getFetchEventListener());
        });
        persistenceManager.register({ scope: new RegExp(MBEregex.source + /users\/~/.source) }).then(function(registration){
          registration.addEventListener('fetch', function (event) {
            if(!profile_request)
              profile_request = event.request.clone();
            event.respondWith(defaultProfileResponseProxy.getFetchEventListener()(event))
          });

          // load user profile
          app.getUserProfile();
        });
      });

      var count = 0;
      var preflightOptionsRequestTimeout = 30000;
      var max_sync = 5;
      
      self.sync = function () {
        count++;
        return persistenceManager.getSyncManager().sync({preflightOptionsRequestTimeout: preflightOptionsRequestTimeout}).then(function(result) {
          count = 0;
          return result;
        }, function(err) {
          if (err.response != null && err.response.status == 504 && count < max_sync) { 
            // try again
            return self.sync();
          } else {
            count = 0;
            return Promise.reject(err); 
          }
        });
      };

      self.getSyncLog = function () {
        return persistenceManager.getSyncManager().getSyncLog();
      }

    }

    return OfflineController;

  }

)
