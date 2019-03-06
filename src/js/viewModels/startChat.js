/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery',
        'appController',
        'dataService',
        'ojs/ojknockout',
        'ojs/ojinputtext'],
function(oj, ko, $, app, data) {
  function startChatViewModel() {
    var self = this;

    // adjust content padding
    self.handleTransitionCompleted = function(info) {  
      app.appUtilities.adjustContentPadding();
    
      var chatTranscript = document.getElementById('innerTranscriptContainer');
      if (chatTranscript) {
        chatTranscript.addEventListener("scroll", function() {
          if (chatTranscript.clientHeight == chatTranscript.scrollHeight - chatTranscript.scrollTop) {
            app.resetNewMessageCounter();
          }
        });
      }

      self.adjustTranscriptHeight();
      self.scrollTranscriptToBottom();
    };

    self.handleBindingsApplied = function(info) {
      if (app.pendingAnimationType === 'navParent') {
        app.preDrill();
      }
    };

    self.adjustTranscriptHeight = function() {
      var chatTranscript = document.getElementById('innerTranscriptContainer');
      var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
      var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];
      if (chatTranscript) {
        chatTranscript.style.height = (window.innerHeight - topElem.offsetHeight - bottomElem.offsetHeight) + 'px';
      }
    }

    self.scrollTranscriptToBottom = function() {
      var chatTranscript = document.getElementById('innerTranscriptContainer');
      var topElem = document.getElementsByClassName('oj-applayout-fixed-top')[0];
      var bottomElem = document.getElementsByClassName('oj-applayout-fixed-bottom')[0];
      if (chatTranscript) {
        if (chatTranscript.scrollHeight <= window.innerHeight - topElem.offsetHeight - bottomElem.offsetHeight) {
          app.resetNewMessageCounter();
        }
        chatTranscript.scrollTop = chatTranscript.scrollHeight;
      }
    }

    window.addEventListener("orientationchange", function() {
      self.adjustTranscriptHeight();
      alert("the orientation of the device is now " + screen.orientation.angle);
    });

    self.adjustContentPadding = function() {
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
        console.log("adjustContentPadding....");
      };

    self.handleSend = function() {
      $('#send-new-message').change({text: self.newMessage }, function(event) {
        app.messageOnSend(event);
      });
    }
    //send attachment (may be later)
    self.handleAttached = function() {
      //$('#upload-new-customer-pic').change({ imgHolder: self.imgSrc }, function(event) {
      //  app.photoOnChange(event);
      //});
    }

    //self.imgSrc = ko.observable('css/images/Add_avatar@2x.png');
/*
    self.chat = {
      inChat: ko.observable(),
      defaultMessage: ko.observable(),
      waitTime: ko.observable(),
      transcript: ko.observable(),
      newMessage: ko.observable()
    };

    self.conclude = function() {
      data.concludeChat(ko.toJS(self.chat)).then(function(response){
        var result = JSON.parse(response);
        app.goToCustomer(result.id);
      }).fail(function(response) {
        oj.Logger.error('Failed to conclude chat.', response);
        self.goToPrevious();
        app.connectionDrawer.showAfterUpdateMessage();
      });
    };
*/
    // go to previous page
    self.goToPrevious = function() {
      window.history.back();
    };

    // create chat page header settings
    self.startChatHeaderSettings = function(){
      return {
        name:'basicHeader',
        params: {
          title: 'Chat',
          startBtn: {
            id: 'backBtn',
            click: self.goToPrevious,
            display: 'icons',
            label: 'Back',
            icons: 'oj-hybrid-applayout-header-icon-back oj-fwk-icon',
            visible: true
          },
          endBtn: {
            id: 'saveBtn',
            click: self.conclude,
            display: 'all',
            label: 'Done',
            icons: '',
            visible: true,
            disabled: app.isReadOnlyMode
          }
        }
      };
    };
    /*
    var defTranscript = "";
    self.transcript = ko.observable(defTranscript);
    data.setTranscript(defTranscript);
    */
    self.addToTranscript = function(newMessage) {
      $('#transcript').val( $('#transcript').val() + "\r\n"+ newMessage);
    }
    //$('#upload-new-customer-pic').change({ imgHolder: self.imgSrc }, function(event) {
      //  app.photoOnChange(event);
      //});
      /*
    self.newMessage = ko.observable('Enter message');
    */
    // handler for send
    self.sendClick = function(event){
      self.addToTranscript($('#newMessage').val());
      $('#newMessage').val('');
        return true;
    }

  }

  return startChatViewModel;

});
