/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
// handles API calls to MCS backend

'use strict';
define(['jquery', 'appConfig'], function ($, appConfig) {

  var baseUrl = appConfig.backendUrl;
  var registrationUrl = appConfig.registrationUrl;

  // Note, the appConfig contains a Basic Authentication header. The use of Basic Auth is
  // not recommended for production apps.
  var baseHeaders = appConfig.backendHeaders;

  var localUrl = 'localData/';

  var isOnline = false;

  function setOnlineMode(mode) {
    isOnline = mode;
  }

  var isChatCloudService = true;
  function setChatCloudServiceMode(mode) {
    isChatCloudService = mode;
  }

  //var endPoint = "";
  var siteUrl = "";
  /*function setEndPoint(ep) {
    endPoint = ep;
  }*/
  function setSite(site) {
    siteUrl = site;
  }
  var authenticated = false;
  function setAuthenticated(auth) {
     authenticated = auth;
  }
  var token = '';
  function setToken(tok) {
    token = tok;
  }
  var chatActive = false;
  function setIsChatActive(isChatActive) {
    chatActive = isChatActive;
  }

  var isTranscriptVisible = false;
  function setShowChatTranscript(showTranscript) {
    isTranscriptVisible = showTranscript;
  }

  var chatStatus = "notStarted";
  function connectToChat() {
    //do rest call
    chatStatus = "connecting";
  }
  function startChat() {
    chatStatus = "InChat";
  }
  function concludeChat(chat) {
    chatStatus = "Ended";
  }

  

  var transcript = "";
  var transcriptList = [];
  var transcriptListMerged = [];
  function clearTranscript() {
    transcript = '';
    transcriptList = [];
  }
  function getTranscriptList() {
    return transcriptList;
  }
  function getTranscriptListMerged() {
    return transcriptListMerged;
  }

  function setTranscriptList(transcripts) {
    transcriptList = transcripts;
  }
  function addTranscript(transcripts) {
    transcriptList = transcriptList.concat(transcripts);

    for (var i = 0; i < transcripts.length; i++) {
      var lastMin = (transcriptListMerged.length > 0 && transcriptListMerged[transcriptListMerged.length -1].time) ? (new Date(transcriptListMerged[transcriptListMerged.length -1].time)).getMinutes() : 0;//will get minutes part soon
      var curMin = (new Date(transcripts[i].time)).getMinutes();
      var isGreeting = ((transcriptListMerged.length > 0 && transcriptListMerged[transcriptListMerged.length -1 ].greeting) || (transcriptListMerged.length > 0 && transcripts[i].greeting));
      if(transcriptListMerged.length > 0 && (transcriptListMerged[transcriptListMerged.length -1].user === transcripts[i].user && transcripts[i].messageType === 'MESSAGE' && !isGreeting && lastMin === curMin )) {
        var updatedItem = {};
        updatedItem.senderType = transcriptListMerged[transcriptListMerged.length -1].senderType;
        updatedItem.user = transcriptListMerged[transcriptListMerged.length -1].user;
        updatedItem.time = transcriptListMerged[transcriptListMerged.length -1].time;
        updatedItem.message = transcriptListMerged[transcriptListMerged.length -1].message + '\r\n' + transcripts[i].message;
        updatedItem.messageType = 'MESSAGE';
        transcriptListMerged.pop();
        transcriptListMerged.push(updatedItem);
        //keep original time.
      }
      else {
        transcriptListMerged.push(transcripts[i]);
      }
    }
  }
  function getTranscript() {
    return transcript;
  }
  function setTranscript(newTranscript) {
    transcript = newTranscript;
  }

  var newMessage = "";
  function getNewMessage() {
    return newMessage;
  }

  function setNewMessage(message) {
    newMessage = message;
  }

  var chatEndPoint = '';
  function setChatEndPoint(endPoint) {
    chatEndPoint = endPoint;
  }

  /*
    Oracle Mobile Chat
    Name: sendRequest  
    purpose: common function to call sendRequest on plugin. 
    @param: options object containing 
      a) request method(post/get....) 
      b) data (payload) 
      c)object containing headers as name value pairs. {'OSvC-CREST-Application-Context':'My application', 'OtherHeader': 'Other header info'}
    @param: endPoint/request url 
    @param: onSuccess -> callback for successful call
    @param: onFailure -> callback for failed call
  */
  function sendRequest(endPoint, options, onSuccess, onFailure) {
    cordova.plugin.http.setDataSerializer('json'); //all change this if content is not json
    //Only work with app, will ignore while using browser
    cordova.plugin.http.setHeader('*', 'Origin', 'http://www.oracle.com'); // set this to appropriated company origin.
    // disable SSL cert checking, only meant for testing purposes, do NOT use in production!
    // does not work with browsers.
    cordova.plugin.http.setSSLCertMode('nocheck', function() {
      console.log('SSL check is disabled!');
      }, function() {
        console.log('Failed to disable SSL check.');
      });

      if (!onSuccess){
        onSuccess = function(){
          console.log("Request sent successfully.")
        };
      }

      if (!onFailure){
        onFailure = function() {
          console.log("Request failed.")
        };
      }

      if (!options.data || 
        options.data.length <= 0){
        options.data = {};
      }

      cordova.plugin.http.sendRequest(endPoint, options, onSuccess, onFailure);
  }

  /*
    Oracle Mobile Chat
    Name: authenticateChatSC
    purpose: authenticate for statign a chat
    @param: userInfo    - Api User id/password information
    @param: serviceCloudEndPoint  - Service Cloud authentication rest endpoint
    @param: payload     - data/session information to be sent with the call
    @param: onSuccess   - function to callback upon successful call
    @param: onFailure   - function to callback upon failed call
  */  
  function authenticateChatSC(userInfo, serviceCloudEndPoint, payload, onSuccess, onFailure) {

    var hdrs = {'OSvC-CREST-Application-Context': 'Reference Implementation'};//, 'Content-Type': 'application/json'};

    if(userInfo && userInfo.apiuser() && userInfo.apiuser().length > 0) {
      //hdrs.Authorization = 'Basic ' + btoa(userInfo.apiuser() + ':' + userInfo.apipassword());
      cordova.plugin.http.useBasicAuth(userInfo.apiuser(), userInfo.apipassword());
    }
    const options = {
      method: 'post',
      data: { "sessionInformation": payload.sessionInformation},
      headers: hdrs
    };

    sendRequest(serviceCloudEndPoint, options, onSuccess, onFailure);
  }



  function authenticateChatEC(userInfo, engagementCloudEndPoint, payload, onSuccess, onFailure) {
    var hdrs = {};

    if (userInfo && userInfo.apiuser() && userInfo.apiuser().length > 0) {
      hdrs.Authorization = 'Basic ' + btoa(userInfo.apiuser() + ':' + userInfo.apipassword());
    }

    return $.ajax({
      type: 'POST',
      headers: hdrs,
//      headers: {'Authorization': 'Basic Y3NzcWExOldlbGNvbWUx'},
      data: JSON.stringify(payload),
      contentType: 'application/vnd.oracle.adf.resourceitem+json',
      // contentType: "application/json",
      url: engagementCloudEndPoint,
      statusCode: {
        404: function(response) {
          throw "404: Not found";
        },
        500: function(response) {
          throw "500: Issue with page/site."
        }
      },
      success: onSuccess,
      error: onFailure
    });
  }
  /*
    Oracle Mobile Chat
    Name: requestEngagement
    purpose: request to start a chat engagement
    @param: endPointUrl - engagement related rest endpoint
    @param: authToken   - token recevied while authenticating/establish session
    @param: queryString - string to attach as part or url query string.
    @param: data        - data payload for the call
    @param: onSuccess   - function to callback upon successful call
    @param: onFailure   - function to callback upon failed call
  */
  function requestEngagement(endPointUrl, authToken, queryString, data, onSuccess, onFailure) {
    const options = {
      method: 'post',
      headers: {'Authorization': 'Bearer ' + authToken}
    };
    if (data && data.length > 0){
      options.data = {data};
    }

    sendRequest(endPointUrl + '?' + queryString, options, function(response){
        onSuccess(JSON.parse(response.data));
      }, 
      function(error){
        onFailure(error);
      });
  }
  /*
    Oracle Mobile Chat
    Name: getMessages
    purpose: get messages and status information for ongoing chat
    @param: endPointUrl - getMessage related rest endpoint
    @param: sessionId   - id of session to terminate
    @param: onSuccess   - function to callback upon successful call
    @param: onFailure   - function to callback upon failed call
  */
  function getMessages(endPointUrl, sessionId, onSuccess, onFailure) {
    const options = {
      method: 'post',
      headers: {'SessionId': sessionId}
    };

    sendRequest(endPointUrl, options, function(response){
        onSuccess(JSON.parse(response.data));
      }, 
      function(error){
        onFailure(error);
      });
  }
  /*
    Oracle Mobile Chat
    Name: postMessage
    purpose: post chat message to server
    @param: endPointUrl - message post related rest endpoint
    @param: sessionId   - id of ongoing chat session
    @param: onSuccess   - function to callback upon successful call
    @param: onFailure   - function to callback upon failed call
  */
  function postMessage(endPointUrl, sessionId, message, onSuccess, onFailure) {
    const options = {
      method: 'post',
      headers: {'SessionId': sessionId},
      data: {'body':  message}
    };

    sendRequest(endPointUrl, options, function(response){
        onSuccess(JSON.parse(response.data));
      }, 
      function(error){
        onFailure(error);
      });
  }
  /*
    Oracle Mobile Chat
    Name: terminate
    purpose: terminate ongoing chat
    @param: endPointUrl - terminate related rest endpoint
    @param: sessionId   - id of session to terminate
    @param: onSuccess   - function to callback upon successful call
    @param: onFailure   - function to callback upon failed call
  */
  function terminate(endPointUrl, sessionId, onSuccess, onFailure) {
    const options = {
      method: 'post',
      headers: {'SessionId': sessionId},
      data: {"clientRequestTime":  Date.now()}
    };

    sendRequest(endPointUrl, options, function(response){
        onSuccess(JSON.parse(response.data));
      }, 
      function(error){
        onFailure(error);
      });
  }

  function registerForNotifications(registration) {
    return $.ajax({
      type: 'POST',
      url: registrationUrl,
      headers: baseHeaders,
      data: JSON.stringify(registration),
      contentType: 'application/json; charset=UTF-8'
    });
  }

  function getCustomers() {
    if(isOnline)
      return $.ajax({
        type: 'GET',
        headers: baseHeaders,
        url: baseUrl + 'customers'
      });
    else {
      return $.ajax(localUrl + 'customers.txt');
    }
  }

  function createCustomer(customer) {
    return $.ajax({
      type: 'POST',
      headers: baseHeaders,
      data: JSON.stringify(customer),
      url: baseUrl + 'customers',
      contentType: 'application/json; charset=UTF-8'
    });
  }

  function updateCustomer(id, customer) {
    return $.ajax({
      type: 'PATCH',
      headers: baseHeaders,
      data: JSON.stringify(customer),
      url: baseUrl + 'customers/' + id,
      contentType: 'application/json; charset=UTF-8'
    });
  }

  function getCustomer(id) {
    if(id) {
      if(isOnline) {
        return $.ajax({
          type: 'GET',
          headers: baseHeaders,
          url: baseUrl + 'customers/' + id
        });
      } else {

        var promise = new Promise(function(resolve, reject){
          $.get(localUrl + 'customers.txt').done(function(response) {
            var customers = JSON.parse(response).result;
            var customer = customers.filter(function(customer) { return customer.id === id; });
            resolve(JSON.stringify(customer[0]));
          }).fail(function(response){
            reject(response);
          });
        });

        return promise;
      }
    }

    return $.when(null);
  }

  function getIncidents() {
    if(isOnline)
      return $.ajax({
        type: 'GET',
        headers: baseHeaders,
        url: baseUrl + 'incidents?technician=~'
      });
    else {
      return $.get(localUrl + 'incidents.txt');
    }
  }

  function getIncidentsStats() {
    if(isOnline)
      return $.ajax({
        type: 'GET',
        headers: baseHeaders,
        url: baseUrl + 'stats/incidents?technician=~'
      });
    else {
      return $.get(localUrl + 'incidentsStats.txt');
    }
  }

  function getIncidentsHistoryStats() {
    if(isOnline) {
      return $.ajax({
        type: 'GET',
        headers: baseHeaders,
        url: baseUrl + 'stats?technician=~&period=annual'
      });
    } else {
      return $.get(localUrl + 'incidentsHistoryStats.txt');
    }
  }

  function createIncident(incident) {
    return $.ajax({
      type: 'POST',
      headers: baseHeaders,
      url: baseUrl + 'incidents',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify(incident)
    });
  }

  function getIncident(id) {
    if(id)
      if(isOnline) {
        return $.ajax({
          type: 'GET',
          headers: baseHeaders,
          url: baseUrl + 'incidents/' + id,
          cache: false
        });
      } else {
        return $.get(localUrl + 'incidents/' + id + '.txt');
      }

    return $.when(null);
  }

  function updateIncident(id, incident) {
    if(id)
      return $.ajax({
        type: 'PUT',
        headers: baseHeaders,
        url: baseUrl + 'incidents/' + id,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(incident)
      });
    return $.when(null);
  }

  function getIncidentActivities(id) {
    if(id) {
      if(isOnline) {
        return Promise.resolve($.ajax({
          type: 'GET',
          headers: baseHeaders,
          url: baseUrl + 'incidents/' + id + '/activities'
        }));
      } else {
        return $.get(localUrl + 'incidents/' + id + '/activities.txt');
      }
    }
  }

  function postIncidentActivity(id, comment, picture) {
    if(id && comment) {

      var activity = { comment: comment, picture: picture };

      return $.ajax({
        type: 'POST',
        headers: baseHeaders,
        url: baseUrl + 'incidents/' + id + '/activities',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(activity)
      });
    } else {
      return $.when(null);
    }
  }

  function updateIncidentActivity(id, actid, content) {
    if(id && actid && content)
      return $.ajax({
        type: 'PATCH',
        headers: baseHeaders,
        url: baseUrl + 'incidents/' + id + '/activities/' + actid,
        data: JSON.stringify(content),
        contentType: 'application/json; charset=UTF-8'
      });
    else
      return $.when(null);
  }

  function getLocation(id) {
    if(id) {
      if(isOnline) {
        return $.ajax({
          type: 'GET',
          headers: baseHeaders,
          url: baseUrl + 'locations/' + id
        });
      } else {

        var promise = new Promise(function(resolve, reject){
          $.get(localUrl + 'locations.txt').done(function(response) {
            var locations = JSON.parse(response);
            var location = locations.filter(function(location) { return location.id === id; });
            resolve(JSON.stringify(location[0]));
          }).fail(function(response){
            reject(response);
          });
        });

        return promise;
      }

    } else {
      return $.when(null);
    }

  }

  function getUserProfile() {
    if(isOnline)
      return $.ajax({
        type: 'GET',
        headers: baseHeaders,
        url: baseUrl + 'users/~'
      });
    else {
      return $.get(localUrl + 'users.txt');
    }
  }

  function updateUserProfile(user) {
    return $.ajax({
      type: 'PATCH',
      headers: baseHeaders,
      url: baseUrl + 'users/~',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify(user)
    });
  }

  return {
    registerForNotifications: registerForNotifications,
    getCustomers: getCustomers,
    createCustomer: createCustomer,
    updateCustomer: updateCustomer,
    getCustomer: getCustomer,
    getIncidents: getIncidents,
    getIncidentsStats: getIncidentsStats,
    getIncidentsHistoryStats: getIncidentsHistoryStats,
    createIncident: createIncident,
    getIncident: getIncident,
    updateIncident: updateIncident,
    getIncidentActivities: getIncidentActivities,
    postIncidentActivity: postIncidentActivity,
    updateIncidentActivity: updateIncidentActivity,
    getLocation: getLocation,
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile,
    setOnlineMode: setOnlineMode,
    setChatCloudServiceMode: setChatCloudServiceMode,
    authenticateChatSC: authenticateChatSC,
    authenticateChatEC: authenticateChatEC,
    setSite: setSite,
    setChatEndPoint: setChatEndPoint,
    setAuthenticated: setAuthenticated,
    setToken: setToken,
    getTranscript: getTranscript,
    setTranscript: setTranscript,
    getNewMessage: getNewMessage,
    setNewMessage: setNewMessage,
    requestEngagement: requestEngagement,
    getMessages: getMessages,
    postMessage: postMessage,
    setIsChatActive: setIsChatActive,
    setShowChatTranscript: setShowChatTranscript,
    getTranscriptList: getTranscriptList,
    setTranscriptList: setTranscriptList,
    addTranscript: addTranscript,
    getTranscriptListMerged: getTranscriptListMerged,
    terminate: terminate
  };
});
