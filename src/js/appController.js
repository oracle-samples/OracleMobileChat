/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
// Application level setup including router, animations and other utility methods

'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'dataService',
        'PushClient',
        'ConnectionDrawer',
        'ojs/ojknockout',
        'ojs/ojnavigationlist',
        'ojs/ojoffcanvas',
        'ojs/ojmodule',
        'ojs/ojrouter',
        'ojs/ojmoduleanimations'],
function (oj, ko, $, data,  PushClient, ConnectionDrawer) {

  oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

  var router = oj.Router.rootInstance;

  // Root router configuration
  router.configure({
    'tour': { label: 'Tour', isDefault: true },
    'incidents': { label: 'Incidents' },
    'signin': { label: 'Sign In' },
    'customers': { label: 'Customers' },
    'profile': { label: 'Profile' },
    'about': { label: 'About' },
    'incident': { label: 'Incident' },
    'settings': { label: 'Settings' },
    'createIncident': { label: 'Create an Incident' },
    'startChat': { label: 'Start a chat with an Agent'}
  });

  function InitializeChat() {

  }

  function AppControllerViewModel() {
    var self = this;

    // push client
    self.pushClient = new PushClient(self);

    //offline controller
    //self.offlineController = new OfflineController(self);

    self.connectionDrawer = new ConnectionDrawer(self);

    self.unreadIncidentsNum = ko.observable();

    self.router = router;

    // drill in and out animation
    var platform = oj.ThemeUtils.getThemeTargetPlatform();

    self.pendingAnimationType = null;

    function switcherCallback(context) {
      return self.pendingAnimationType;
    }

    function mergeConfig(original) {
      return $.extend(true, {}, original, {
        'animation': oj.ModuleAnimations.switcher(switcherCallback),
        'cacheKey': self.router.currentValue()
      });
    }

    self.moduleConfig = mergeConfig(self.router.moduleConfig);

    function positionFixedTopElems(position) {
      var topElems = document.getElementsByClassName('oj-applayout-fixed-top');

      for (var i = 0; i < topElems.length; i++) {
        // Toggle between absolute and fixed positioning so we can animate the header.
        // We don't need to adjust for scrolled content here becaues the animation utility
        // moves the contents to a transitional div losing the scroll position
        topElems[i].style.position = position;
      }
    }

    self.preDrill = function() {
      positionFixedTopElems('absolute');
    };

    self.postDrill = function() {
      positionFixedTopElems('fixed');
      self.pendingAnimationType = null;
    };

    // public chat
    var defaultSite = "https://day106-19200-sql-138h.qa.lan/services/rest/crossChannelServices/latest/establishSessions";
    //"http://sanjeevsuper.denae483.us.oracle.com/cgi-bin/sanjeevsuper.cfg/php/admin/authenticate.php";

    self.site = ko.observable(defaultSite);
    data.setSite(self.site);

    var defaultChatEndPoint = '';
    self.chatEndPoint = ko.observable(defaultChatEndPoint);
    data.setChatEndPoint(self.chatEndPoint);
    
    self.tenant = ko.observable("sc");

    var defaultApiUser = '';
    var defaultApiPwd = '';
    self.apiUser = ko.observable(defaultApiUser);
    self.apiPwd = ko.observable(defaultApiPwd); 
    // end public chat

    // set default connection to MCS backend
    var defaultConnection = false;
    self.isOnlineMode = ko.observable(defaultConnection);
    data.setOnlineMode(defaultConnection);

    //chat cloud service
    var defaultChatCloudService = false;
    self.isChatCloudServiceMode = ko.observable(defaultChatCloudService);
    data.setChatCloudServiceMode(defaultChatCloudService);

    // disable buttons for post/patch/put
    self.isReadOnlyMode = true;

    self.isOnlineMode.subscribe(function(newValue) {
      data.setOnlineMode(newValue);
    });

    var defShowChatTranscript = false;
    self.showChatTranscript = ko.observable(defShowChatTranscript);
    data.setShowChatTranscript(defShowChatTranscript);

    var defIsChatActive = false;
    self.isChatActive = ko.observable(defIsChatActive);
    data.setIsChatActive(self.isChatActive);

    var defaultAuthenticated = false;
    self.isAuthenticated = ko.observable(defaultAuthenticated);
    data.setAuthenticated(self.isAuthenticated);
    
    var defultJWT = '';
    self.authToken = ko.observable(defultJWT);
    data.setToken(defultJWT);

    self.endPointValid = true;
    self.endPointPresentAndValid = function() {
      if( self.site && self.site.length > 0) {
        return self.endPointValid;
      }
      return true; 
    }

    var defQueuePos = -1;
    var defWaitTime = 0;
    self.queuePos = ko.observable(defQueuePos);
    self.waitTime = ko.observable(defWaitTime);

    var defTranscript = '';
    self.transcript = ko.observable(defTranscript);
    data.setTranscript(defTranscript);
    
    var defTranscriptList = data.getTranscriptList();
    self.transcriptList = ko.observableArray(defTranscriptList);

    var defTranscriptListMerged = data.getTranscriptListMerged();
    self.transcriptListMerged = ko.observableArray(defTranscriptListMerged);

    var defNewMessage = '';
    self.newMessage = ko.observable(defNewMessage);
    data.setNewMessage(self.newMessage);

    self.question = "";
    self.questionSet = ko.observable(false);
    self.setUpQuestion = function() {
      if(self.question && self.question.length > 0 && self.questionSet()){
        data.setShowChatTranscript(false);
        self.showChatTranscript(false);
        adjustContentPadding();
        self.startChat();
      }
      else { 
        //  for enter
        // Get the input field
        var quesInput = document.getElementById("question");

        if(quesInput) {
          quesInput.removeEventListener("keyup", self.setQuestionKeyUp);
          // Execute a function when the user releases a key on the keyboard
          quesInput.addEventListener("keyup", self.setQuestionKeyUp);
        }
        // end
        self.router.go('startChat');
      }
    };

    self.onSetQuestionClicked = function() {
        if (self.question && self.question.length > 0) {
          self.questionSet(true);
        }

        self.setUpQuestion();
    };

    self.startChat = function() {
      //self.fromIncidentsTab = 'tablist';
      self.chatFailureMessage = '';
      if(!self.isChatCloudServiceMode()) {
        self.router.go('settings');
      } else if (self.question.length == 0 || !self.questionSet()) {
        self.setUpQuestion();
      } else {
        if(self.isAuthenticated() && self.authToken()) {
          //will add other stuff here
          self.router.go('startChat');
        } else {
          if(self.chatStatus === "AUTHENTICATING") {
            self.router.go('startChat');
          } else {
            //Authenticate chat
            self.chatStatus = "AUTHENTICATING";
            var profile = self.userProfileModel();

            switch(self.tenant()) {
              case "sc":
                self.authenticateSC(profile);
                break;
              case "ec":
                self.authenticateEC(profile);
                break;
              default:
                self.authenticateSC(profile);
                break;
            }

            if(self.isAuthenticated() && self.authToken()) {
              //will add other stuff here
              self.router.go('startChat');
            }
            else {
              self.endPointValid = false;
            }
          }
        }        
      }
    };

    self.authenticateSC = function(profile) {
      var sessionInformation = {
        "emailAddress":  profile.email(),
        "firstName": profile.firstName(),
        "lastName":  profile.lastName(),
        "customFields": [{
          "name": "location",
          "type": "string",
          "value": profile.location.formattedAddress()
        }],
        "question": self.question,
        "auxiliaryData": {
          "BROWSER": navigator.userAgent,
          "OPERATING_SYSTEM": navigator.platform,
          "USER_AGENT":navigator.product
        }
      };

      var payload = {
        "sessionInformation": JSON.stringify(sessionInformation)
      };

      data.authenticateChatSC({'apiuser': self.apiUser, 'apipassword': self.apiPwd}, self.site(), payload, self.onSuccessAuthenticateChat, self.onFailureAuthenticateChat);
    };

    self.authenticateEC = function(profile) {
      var payload = {
        "authUserName": "jefftest",
        "firstName": "jeff",
        "lastName": "jeff",
        "emailAddress": "jefftest",
        "interfaceId": 1,
        "queueId": 1,
        "productId": null,
        "incidentId": null,
        "incidentType": null,
        "resumeType": "RESUME",
        "question": self.question,
        "mediaList": "CHAT"
      };

      data.authenticateChatEC({'apiuser': self.apiUser, 'apipassword': self.apiPwd}, self.site(), payload, self.onSuccessAuthenticateChat, self.onFailureAuthenticateChat);
    };

    self.onChatBackClicked = function() {
      window.history.back();
    };

    self.pool = '';

    self.onSuccessAuthenticateChat = function(resp) {
      var response = (resp.data) ? resp.data : resp;
      console.log(response);
      var result = (response.channelToken || response.jwt) ? response : JSON.parse(response);
      if( result && (result.jwt || result.channelToken)) {
        self.endPointValid = true;
        self.isAuthenticated(true);

        /* temp */
        var devEndpoint = (result.channelToken) ? false : true;
        var apiLoc = '/engagement/api/consumer/';
        var apiVer = 'v1';
        var protocol = self.site().split('/')[0] + '//';  //(location.protocol === 'https')? 'https://' : 'http://';
        self.authToken(devEndpoint ? result.jwt : result.channelToken);
        if( result.sessionServerResponse ){
          var chatResponse = JSON.parse(result.sessionServerResponse);
          result.domain = chatResponse.domain;
          result.pool = chatResponse.pool;
          if(chatResponse.port) {
            result.port = chatResponse.port;
          }
        }
        self.chatEndPoint = (devEndpoint) ?
          protocol + result.domain + apiLoc + result.chatSiteName + '/' + apiVer + '/' :
          protocol + result.domain + ((result.port && result.port.length > 0) ? (':' + result.port) : '') + apiLoc + result.siteName + '/' + apiVer + '/';

        self.pool = devEndpoint ? result.poolId : result.pool;
        data.requestEngagement(self.chatEndPoint + 'requestEngagement', self.authToken(), 'pool=' + self.pool + '&', {}, self.onSuccessRequestEngagement, self.onFailureRequestEngagement);
      }
      else {
        self.endPointValid = false;
      }      
    }

    self.onFailureAuthenticateChat = function(xhr, options, error) {
      oj.Logger.warn('Failed to connect to site/endpoint for authentication. ' + error);
      if (xhr.status == 404) {
        console.log("404.....");
      }
      self.endPointValid = false;
      self.chatStatus = "FAILED";
      self.chatFailureMessage = 'Failed to authenticate for chat';
      self.router.go('settings');
    }

    self.engagement = {clientId: 0, engagementId: 0, resultType: 'NONE', sessionId: ''};
    self.retryAttempt = 0;
    self.onSuccessRequestEngagement = function(response) {
      console.log(response);
      self.engagement.clientId = response.clientId;
      self.engagement.engagementId = response.engagementId;
      self.engagement.resultType = response.resultType;
      self.engagement.sessionId = response.sessionId;
      self.router.go('startChat');
      self.getMessagesLoop();
    }

    self.onFailureRequestEngagement = function(xhr, options, error) {
      console.log("Failed while requesting engagement.");
      self.endPointValid = false;
      self.chatStatus = "FAILED";
      self.chatFailureMessage = 'Failed to requestEngagement';
      self.resetChat();
      self.router.go('settings');
    }

    self.initiateQuestion = function(event){
      if (event.detail.previousValue === "") {
        //  for enter
        // Get the input field
        var qInput = document.getElementById("question");

        if(qInput) {
          qInput.removeEventListener("keyup", self.setQuestionKeyUp);
          // Execute a function when the user releases a key on the keyboard
          qInput.addEventListener("keyup", self.setQuestionKeyUp);
        }
        // end     
      }
    }

    self.setQuestionKeyUp = function(event) {
      // Cancel the default action, if needed
      if(event.hasOwnProperty('preventDefault')) {
        event.preventDefault();
      }
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Trigger the button element with a click
        if (self.question && self.question.length > 0) {
          self.questionSet(true);
        }
        self.setUpQuestion();
      }
    };

    self.sendMsgKeyUp = function(event) {
      // Cancel the default action, if needed
      if(event.hasOwnProperty('preventDefault')) {
        event.preventDefault();
      }
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Trigger the button element with a click
        self.onSendClicked();
      }
    };

    self.getMessagesLoop = function() {
      //  for enter
      // Get the input field
      var msgInput = document.getElementById("newMessage");

      if(msgInput) {
        msgInput.removeEventListener("keyup", self.sendMsgKeyUp);
        // Execute a function when the user releases a key on the keyboard
        msgInput.addEventListener("keyup", self.sendMsgKeyUp);
      }
      // end

      var chatCommand = 'getMessages';
      var urlDetails  = self.chatEndPoint + chatCommand + '?pool=' + self.pool + '&';

      var timeout = setTimeout(function () {
        if (self.isAuthenticated()) {//we can test if chat is still on
          data.getMessages(urlDetails, self.engagement.sessionId, self.onSuccessGetMessages, self.onFailureGetMessages);
        }
      }, 500);
    }
    
    self.onSuccessGetMessages = function(response) {
      if (response.errorMessages.length === 0) {
        self.retryAttempt = 0;
        console.log("GetMessages ==> got response " + JSON.stringify(response));
        self.handleGetMessagesResponse(response);
        self.getMessagesLoop();
      }
      else {
        self.retryAttempt++;
        if( self.retryAttempt < 10) {
          self.getMessagesLoop();
        }
        console.log("****GetMessages ==> got errors  " + response.errorMessages);
      }
    }

    var defAgentResponding = false;
    self.agentResponding = ko.observable(defAgentResponding);
    self.isAgentResponding = function() {
      return self.agentResponding;
    }

    function timeFormatter(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }

    self.chatStatus = 'NONE';
    self.chatFailureMessage = '';
    self.agent = [];
    self.clientInfo = {};
	  self.newMessageCount = 0;
	  self.newMessages = ko.observable(self.newMessageCount);
    self.handleGetMessagesResponse = function(response) {
      var newCom = '';
      var newTrans = [];
      var endMsg;
      var startMsg;

      if( response.systemMessages && response.systemMessages.length > 0) {
        for (var index in response.systemMessages) {
          var message = response.systemMessages[index];
          var newTransItem = {};
          switch (message.messageName) {
            case 'RNEngagementActivityChangedMessage':
                console.log('Activity Changed.');
                if (message.mode && message.mode === "RESPONDING") {
                  self.agentResponding(true);
                }
              break;
            case 'RNEngagementConcludedMessage':
              //
              newTransItem.senderType = ((message.reason === 'AGENT_CONCLUDED') ?  'agent' : (message.reason === 'END_USER_CONCLUDED')? 'enduser': 'System');
              newTransItem.time = (new Date(message.createdTime)).toUTCString();
              newTransItem.user = 'System';
              newTransItem.message = 'Chat ended';
              newTransItem.messageType = 'ENDED';
              newTrans.push(newTransItem);

              newCom += 'Chat has been concluded ' + ((message.reason === 'AGENT_CONCLUDED') ? 'by ' + self.agent[0] + '.' : (message.reason === 'END_USER_CONCLUDED')? 'by you.': 'due to unknown reason.');

              self.chatStatus = "CONCLUDED";
              data.setIsChatActive(false);
              self.isChatActive(false);
              data.setShowChatTranscript(true);
              self.showChatTranscript(true);
              self.agentResponding(false);
              endMsg =  [{senderType: 'System', time: Date.now(), user: 'System', messageType: 'EDGE', message: (message.reason === 'QUEUE_TIMEOUT') ? 'Request for chat was timed out, please try again later.' : 'Chat ended.'}];
              self.resetChat();
              self.queuePos(-1);
              self.agent.splice(self.agent.indexOf(self.clientInfo[message.clientId]));
              break;
            case 'RNEngagementConfigurationChangedMessage':
                console.log('Configuration Changed');
              break;
            case 'RNEngagementConsumerErrorOccurredMessage':

              break;
            case 'RNEngagementMediaInvitationMessage':

              break;
            case 'RNEngagementMediaStatusMessage':

              break;
            case 'RNEngagementMessagePostedMessage':
              newCom += self.clientInfo[message.clientId] + ' : ' + message.body
              newTransItem.senderType = 'agent';
              newTransItem.time = (new Date(message.createdTime)).toUTCString();
              newTransItem.user = self.clientInfo[message.clientId];
              newTransItem.message = message.body.replace(/&nbsp;/g,' ');
              newTransItem.messageType = 'MESSAGE';
			        self.incrementNewMessageCounter();
              newTrans.push(newTransItem);
              self.agentResponding(false);
              break;
            case 'RNEngagementParticipantAddedMessage':
              data.setIsChatActive(true);
              self.isChatActive(true);
              data.setShowChatTranscript(true);
              self.showChatTranscript(true);
              if(message.role === 'LEAD') {
                var inConf = (self.agent.length > 0) ? true : false;
                //remove if present then add at the begining
                //will have to modify based on supervisor stuff
                if(self.agent.indexOf(message.name) >= 0)
                {
                  self.agent.splice(self.agent.indexOf(message.name));
                }
                self.agent.unshift(message.name);
                var startTime = Date.now();
                if(!inConf) {
                  startMsg =  [{senderType: 'System', time: startTime, user: 'System', messageType: 'EDGE', message: 'Chat started  '}];
                }
              }
              else { // just append it
                self.agent.push(message.name);
              }

              self.clientInfo[message.clientId] = message.name;

              newCom +=  message.name + ' : ' + message.greeting;

              newTransItem.senderType = 'agent';
              newTransItem.time = (new Date(message.createdTime)).toUTCString();
              newTransItem.user = message.name;
              newTransItem.message = message.greeting;
              newTransItem.messageType = 'MESSAGE';
              newTransItem.greeting = true;
              newTrans.push(newTransItem);
              self.agentResponding(false);
              self.chatStatus = "CHATTING";
              break;
            case 'RNEngagementParticipantConnectionStateChangedMessage':
                console.log('Participant connnection state changed');
              break;
            case 'RNEngagementParticipantLeftMessage':
              if (message.role && message.role === 'LEAD' && message.disconnectReason && message.disconnectReason === 'TRANSFERRED_TO_QUEUE') {
                newTransItem.senderType = 'agent';
                newTransItem.time = (new Date(message.createdTime)).toUTCString();
                newTransItem.user = 'System';
                newTransItem.message = 'Chat ended';
                newTransItem.messageType = 'ENDED';
                newTrans.push(newTransItem);

                newCom += 'Chat has been requeued.';

                data.setShowChatTranscript(false);
                self.showChatTranscript(false);
                self.agentResponding(false);
                endMsg =  [{senderType: 'System', time: Date.now(), user: 'System', messageType: 'EDGE', message: 'Request for chat was requeued.'}];
                self.queuePos(-1);
              }
              else if(message.role && message.role === 'CONFEREE' && message.disconnectReason && message.disconnectReason === 'PARTICIPANT_LEFT'){
                newCom += 'Conferee has left.';
                newTransItem.senderType = 'agent';
                newTransItem.time = (new Date(message.createdTime)).toUTCString();
                newTransItem.user = self.clientInfo[message.clientId];
                newTransItem.message = self.clientInfo[message.clientId] + ' has left the chat.';
                newTransItem.messageType = 'MESSAGE';
                newTransItem.greeting = true;
                newTrans.push(newTransItem);
              }
              self.agent.splice(self.agent.indexOf(self.clientInfo[message.clientId]));
              console.log('Participant left');
              break;
            case 'RNEngagementRoleChangedMessage':

             break;
            case 'RNEngagementWaitInformationChangedMessage':
                self.queuePos(message.position);
                self.waitTime(self.formatSecondsToMinutes(message.expectedWaitTimeSeconds));
              break;
            case 'RNEngagementMediaTokenMessage':

              break;
            case 'RNEngagementFileAttachmentStatusMessage':

              break;
            case 'RNEngagementFileAttachmentMessage':

              break;
            default: 
              console.log('Unrecognized message... ' + message.toString());

          }
        }
      }
      if(newCom.length > 0) {
        adjustContentPadding();
        data.setTranscript(data.getTranscript() + '\r\n' + newCom);
        self.transcript(data.getTranscript());
        if(startMsg) {
          data.addTranscript(startMsg);
          adjustContentPadding();
          data.addTranscript([{senderType: 'System', time: Date.now(), user: 'System', messageType: 'QUESTION', message: self.question}])
        }
        data.addTranscript(newTrans);
        if(endMsg) {
          data.addTranscript(endMsg);
        }
        self.transcriptList(data.getTranscriptList());
        self.transcriptListMerged(data.getTranscriptListMerged());
      }
    }

    self.formatSecondsToMinutes = function(seconds) {
      if(seconds > 60) {
        var minutes = Math.floor(seconds/60);
        return ('00' +minutes).slice(-2) + ':' + ('00' + (seconds - minutes*60)).slice(-2) + '.';  
      }
      else return '00:' + ('00' + seconds).slice(-2) + '.';
    }

    self.onFailureGetMessages = function(response) {
      console.log("GetMessages Failed......" + response);
      self.retryAttempt++;
      self.chatStatus = "FAILED";
      self.chatFailureMessage = 'Failed to get messages.';
    }

    self.onSendClicked = function() {
      //post message
      if( self.isChatActive() && self.newMessage().length > 0){
        var chatCommand = 'postMessage';
        var urlDetails  = self.chatEndPoint + chatCommand + '?pool=' + self.pool + '&';

        data.setNewMessage(self.newMessage());
        console.log(self.newMessage());
        data.postMessage(urlDetails, self.engagement.sessionId,  self.newMessage(), self.onSuccessPostMessage, self.onFailurePostMessage);
        data.setTranscript(data.getTranscript() + '\r\n' + self.userProfileModel().firstName() + ' ' + self.userProfileModel().lastName() + ' : ' + self.newMessage());
        self.transcript(data.getTranscript());

        data.addTranscript([{'senderType': 'enduser', 'time':  new Date().toUTCString(), 'user': self.userProfileModel().firstName() + ' ' + self.userProfileModel().lastName(), 'messageType': 'MESSAGE', 'message': self.newMessage()}]);    

        data.setNewMessage('');
        self.newMessage('');  
        self.transcriptList(data.getTranscriptList());
        self.transcriptListMerged(data.getTranscriptListMerged());
        adjustContentPadding();
  	    self.scrollTranscriptToBottom();
      }
    }

    self.onTranscriptScrolled - function() {
      self.resetNewMessageCounter();
    }	

  	self.scrollTranscriptToBottom = function() {
        var chatTranscript = document.getElementById('innerTranscriptContainer');
        var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
        var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];
        if (chatTranscript) {
          if (chatTranscript.scrollHeight <= window.innerHeight - topElem.offsetHeight - bottomElem.offsetHeight) {
            self.resetNewMessageCounter();
          }
          chatTranscript.scrollTop = chatTranscript.scrollHeight;
          adjustContentPadding();

        }
  	}

    self.onSuccessPostMessage = function(response) {
      console.log('After successful Post message ' + JSON.stringify(response));
      //add to transcript 
      data.setTranscript(data.getTranscript() + '\r\n' + self.newMessage());
      //clear textbox
      data.setNewMessage('');
    }

    self.onFailurePostMessage = function(response) {
      // show error somewhere.
      console.log("Post failed with error " + JSON.stringify(response));
    }

    self.onTerminateClicked = function() {
      if( self.isChatActive()){
        var chatCommand = 'concludeEngagement';
        var urlDetails  = self.chatEndPoint + chatCommand;
        data.terminate(urlDetails, self.engagement.sessionId,  self.onSuccessTerminate, self.onFailureTerminate);
        self.resetChat();
      }
    }

    self.onSuccessTerminate = function(response) {
      self.chatStatus = "CONCLUDED";
      self.chatFailureMessage = '';
      data.setIsChatActive(false);
      self.isChatActive(false);

      data.addTranscript({"senderType": 'enduser', "time": (new Date()).toUTCString(), 'user': self.userProfileModel().firstName() + ' ' + self.userProfileModel().lastName(), 'message': 'Chat has been concluded.' });

      self.transcriptList(data.getTranscriptList());
      self.transcriptListMerged(data.getTranscriptListMerged());    
    }

    self.onFailureTerminate = function(response) {
      // show error somewhere.
      console.log("Terminate failed with error " + JSON.stringify(response));
    }

    self.resetChat = function() {
        // Resets all fields that get set when starting a chat
        // Should allow a new chat to begin
        var questionField = document.getElementById('question');
        if (questionField){
          questionField.value = '';
        }
        self.question = '';
        self.questionSet(false);
        data.setShowChatTranscript(false);
        self.showChatTranscript(false);
        self.endPointValid = false;
        self.isAuthenticated(false);
        self.authToken('');
        self.chatEndPoint = '';
        self.pool = '';
        self.resetNewMessageCounter();
        self.setUpQuestion();
        adjustContentPadding();
    };

    // Load user profile
    self.userProfileModel = ko.observable();

    self.getUserProfile = function () {
      data.getUserProfile().then(function(response){
        self.processUserProfile(response);
      }).catch(function(response){
        oj.Logger.warn('Failed to connect to MCS. Loading from local data.');
        self.isOnlineMode(false);
        //load local profile data
        data.getUserProfile().then(function(response){
          self.processUserProfile(response);
        });
      });
    }

    self.mapUserProfile = function(result) {
      /*
      var vm = ko.observable();

      for(var prop in result){
        if(result.hasOwnProperty(prop)){
          if(typeof(result[prop]) !== "object"){
            vm[prop] = ko.observable(result[prop]);
          }
          else{
            vm[prop] = self.mapUserProfile(result[prop]);
          }
        }
      }

      return vm;*/
    }

    self.processUserProfile = function(response) {
      var result = JSON.parse(response);

      if(result) {
        self.initialProfile = result;
        //var vm = self.mapUserProfile(result);

        var vm = ko.observable();
        vm.id = ko.observable(result.id);
        vm.email = ko.observable(result.email);
        vm.firstName = ko.observable(result.firstName);
        vm.lastName = ko.observable(result.lastName);
        vm.home = ko.observable(result.home);
        vm.mobile = ko.observable(result.mobile);
        vm.photo = ko.observable(result.photo);
        vm.role = ko.observable(result.role);
        vm.locationId = ko.observable(result.locationId);
        var loc = ko.observable();
        loc.id = ko.observable(result.location.id);
        loc.formattedAddress = ko.observable(result.location.formattedAddress);
        loc.street1 = ko.observable(result.location.street1);
        loc.street2 = ko.observable(result.location.street2);
        loc.city = ko.observable(result.location.city);
        loc.state = ko.observable(result.location.state);
        loc.zip = ko.observable(result.location.zip);
        loc.country = ko.observable(result.location.country);
        loc.latitude = ko.observable(result.location.latitude);
        loc.longitude = ko.observable(result.location.longitude);
        vm.location = loc;
        self.userProfileModel(vm);
        }
    }

    self.updateProfileData = function() {
      self.initialProfile = ko.mapping.toJS(self.userProfileModel);
      data.updateUserProfile(self.initialProfile).then(function(response){
        // update success
      }).catch(function(response){
        oj.Logger.error(response);
        self.connectionDrawer.showAfterUpdateMessage();
      });
    };

    // Revert changes to user profile
    self.revertProfileData = function() {
      self.userProfileModel(ko.mapping.fromJS(self.initialProfile));
    };

    // initialise spen plugin
    self.spenSupported = ko.observable(false);
    initialise();

    function initialise() {
      if (window.samsung) {
        samsung.spen.isSupported(spenSupported, spenFail);
      }
    }

    function spenSupported() {
      self.spenSupported(true);
    }

    function spenFail(error) {
      oj.Logger.error(error);
    }

    self.isChatAllowed = function() {
      var curState = router.stateId();
      return curState !== 'tour'  && curState !== 'signin' && curState !== 'profile' && curState !== 'settings' && curState !== 'startChat';
    }
    var prevPopupOptions = null;

    self.setupPopup = function(imgSrc) {

      // Define the success function. The popup launches if the success function gets called.
      var success = function(imageURI) {

        if(imageURI.length > 0) {
          // SPen saves image to the same url
          // add query and timestamp for versioning of the cache so it loads the latest
          imageURI = imageURI + '?' + Date.now();
          imgSrc(imageURI);
        }

      }

      // Define the faliure function. An error message displays if there are issues with the popup.
      var failure = function(msg) {
        oj.Logger.error(msg);
      }

      // If there are any previous popups, remove them first before creating a new popup
      if (prevPopupOptions !== null){
        // Call the removeSurfacePopup method from the SPen plugin
        samsung.spen.removeSurfacePopup(prevPopupOptions.id, function() { }, failure);
      }

      var popupOptions = {};
      popupOptions.id = "popupId";

      popupOptions.sPenFlags = 0;

      // strip off suffix from compressed image
      var imageURL;
      if(imgSrc().lastIndexOf('?') > -1) {
        imageURL = imgSrc().slice(0, imgSrc().lastIndexOf('?'));
      } else {
        imageURL = imgSrc();
      }

      popupOptions.imageUri = imageURL;
      popupOptions.imageUriScaleType = samsung.spen.IMAGE_URI_MODE_STRETCH;
      popupOptions.sPenFlags = samsung.spen.FLAG_PEN | samsung.spen.FLAG_ERASER | samsung.spen.FLAG_UNDO_REDO |
                            samsung.spen.FLAG_PEN_SETTINGS;
      popupOptions.returnType = samsung.spen.RETURN_TYPE_IMAGE_URI;

      //Launch the popup
      prevPopupOptions = popupOptions;
      samsung.spen.launchSurfacePopup(popupOptions, success, failure);

    };

    // Navigate to customer by id
    self.goToCustomer = function(id) {
      self.router.go('customers/customerDetails/' + id);
    };

    // Navigate to incident by id
    self.goToIncident = function(id, from) {
      self.router.go('incident/' + id);
      self.fromIncidentsTab = from;
    };

    self.goToSignIn = function() {
      self.router.go('signin');
    };

    self.goToIncidents = function() {
      var destination = self.fromIncidentsTab || 'tablist';
      self.router.go('incidents/' + destination);
    };

    self.goToCreateIncident = function() {
      self.fromIncidentsTab = 'tablist';
      self.router.go('createIncident');
    };

    self.drawerChange = function (event) {
      self.closeDrawer();
    };

    self.toggleDrawer = function () {
      return oj.OffcanvasUtils.toggle({selector: '#navDrawer', modality: 'modal', content: '#pageContent' });
    };

    self.closeDrawer = function () {
      return oj.OffcanvasUtils.close({selector: '#navDrawer', modality: 'modal', content: '#pageContent' });
    };

    self.bottomDrawer = { selector: '#bottomDrawer', modality: 'modal', content: '#pageContent', displayMode: 'overlay' };

    self.openBottomDrawer = function(imageObject, saveURI) {

      self.updateProfilePhoto = function(sourceType) {

        var cameraOptions = {
            quality: 50,
            destinationType: saveURI ? Camera.DestinationType.FILE_URI : Camera.DestinationType.DATA_URL,
            sourceType: sourceType,
            encodingType: 0,     // 0=JPG 1=PNG
            correctOrientation: true,
            targetHeight: 2000,
            targetWidth: 2000
        };

        navigator.camera.getPicture(function(imgData) {
          if(saveURI) {
            imageObject(imgData)
          } else {
            imageObject("data:image/jpeg;base64," + imgData);
          }
        }, function(err) {
          oj.Logger.error(err);
        }, cameraOptions);

        return oj.OffcanvasUtils.close(self.bottomDrawer);

      };

      return oj.OffcanvasUtils.open(self.bottomDrawer);
    };

    self.closeBottomDrawer = function() {
      return oj.OffcanvasUtils.close(self.bottomDrawer);
    };

    // upload photo
    self.photoOnChange = function(event) {

      var imgHolder = event.data.imgHolder;

      // Get a reference to the taken picture or chosen file
      var files = event.target.files;
      var file;

      if (files && files.length > 0) {
        file = files[0];
        try {
          var fileReader = new FileReader();
          fileReader.onload = function (event) {
            imgHolder(event.target.result);
          };
          fileReader.readAsDataURL(file);
        } catch (e) {
          oj.Logger.error(e);
        }
      }
    };

    // Common utility functions for formatting
    var avatarColorPalette = ["#42ad75", "#17ace4", "#e85d88", "#f4aa46", "#5a68ad", "#2db3ac", "#c6d553", "#eb6d3a"];

    var userAvatarColor = "#eb6d3a";

    var formatAvatarColor = function (role, id) {
      if(role.toLowerCase() === 'customer') {
        return avatarColorPalette[id.slice(-3)%8];
      } else {
        return userAvatarColor;
      }
    };

    var formatInitials = function(firstName, lastName) {
      if(firstName && lastName) {
        return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
      }
    };

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var formatTimeStamp = function(timeString) {

      var timeStamp = Date.parse(timeString);
      var date = new Date(timeStamp);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var formattedTime = hours + ':' + minutes.substr(-2);

      var monthName = monthNames[date.getMonth()].substr(0, 3);
      var dateString = "0" + date.getDate();
      var formattedDate = monthName + ' ' + dateString.substr(-2);

      return {
        time: formattedTime,
        date: formattedDate
      };
    };

    // automatically adjust content padding when top fixed region changes
    var adjustContentPadding = function() {
      var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
      var contentElems = document.getElementsByClassName('oj-applayout-content');
      var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];

      for(var i=0; i<contentElems.length; i++) {
      if (topElem) {
        contentElems[i].style.paddingTop = topElem.offsetHeight+'px';
      }

      if (bottomElem) {
        contentElems[i].style.paddingBottom = bottomElem.offsetHeight+'px';
      }
      // Add oj-complete marker class to signal that the content area can be unhidden.
      contentElems[i].classList.add('oj-complete');
      }
    };
	
	self.incrementNewMessageCounter = function() {
		self.newMessageCount += 1;
		self.newMessages(self.newMessageCount);
	};
	
	self.resetNewMessageCounter = function() {
		self.newMessageCount = 0;
		self.newMessages(self.newMessageCount);
	};

    self.appUtilities = {
      formatAvatarColor: formatAvatarColor,
      formatInitials: formatInitials,
      formatTimeStamp: formatTimeStamp,
      adjustContentPadding: adjustContentPadding
    };
  }

  return new AppControllerViewModel();

});
