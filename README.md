ADDITIONAL INSTALLATION INFORMATION
-----------------------------------

*This sample application is intended to illustrate the use of Chat REST APIs for [Oracle Service Cloud ](https://docs.oracle.com/en/cloud/saas/service/19a/cxscc/toc.htm) and [Oracle Engagement Cloud ](https://docs.oracle.com/en/cloud/saas/engagement/19a/facoe/index.html). These APIs can be used to build custom chat interfaces for web and mobile apps. It is built using [Oracle JET](https://www.oracle.com/webfolder/technetwork/jet/index.html). To take complete advantage of this sample application, please follow the additional installation instructions below.*

1. Prerequsites  
    1.  Install node.js (8.x) and npm by going to [Nodejs](https://nodejs.org/en/)
    1.  Download and install python (2.x) from [Python](https://www.python.org/)
    1.  Install [Oracle OJET CLI](https://www.oracle.com/webfolder/technetwork/jet/index.html)
        >npm install -g @oracle/ojet-cli
    1.  Install [Oracle OJET tooling](https://www.oracle.com/webfolder/technetwork/jet/index.html)
        >npm install -g @oracle/oraclejet-tooling
    1.  Install [Cordova](https://cordova.apache.org/) 
        >npm install -g cordova
    1.  Install [node-gyp](https://github.com/nodejs/node-gyp)
        >npm install -g node-gyp 
2. Theming - the app requires a custom theme
    1. Install node-sass:
        >ojet add sass
    1. Install node modules:
        >npm install
    1. Build app with existing custom theme:
        >ojet build --theme=fif:[android|ios|windows]
3. Hybrid App Configuration
    1. Extend to hybrid project:
        > ojet add hybrid --platforms=[android|ios|windows] --appid=com.jet.oraclemobilechat --appname=OracleMobileChat
        * If you intend to deploy to an iOS device, specify an appid that matches your iOS provisioning profile
        * If you have already scaffolded the app and wish to change the appid, you can edit hybrid/config.xml
        * You can only deploy to iOS from a Mac and you can only deploy to Windows from Windows 10

    2. Install [Cordova Advanced HTTP](https://www.npmjs.com/package/cordova-plugin-advanced-http)
        >ojet add plugin cordova-plugin-advanced-http
        * Update origin header for your domain, that is configured for CORS (dataService.js line 147)

4. Enable a full-access backend (optional)
    * If you have access to a backend service, for example, Oracle Mobile Cloud Service (MCS) mobile backend (MBE), you can easily hook that up with this application.
      1. Implement your own MCS MBE that provides GET, PUT, POST, PATCH and DELETE APIs
      1. Enable create & update features in the app by setting self.isReadOnlyMode = false; in src/js/appController.js
      1. Edit src/js/appConfigExternal.js to specify the connection details of the MBE you have implemented in step 4.1

5. Enable push notifications (optional)
    * The app supports push notifications, which can be enabled as follows:
      1. Follow all the steps 4.1-4.3 above
      2. Create a Google Project that uses Firebase Cloud Messaging and/or create an iOS provisioning profile with push capability
      3. Add Android & iOS mobile clients to your MCS MBE and in their profiles specify the requisite FCM & APNs details obtained in step 5.2
      4. In your MBE, call the MCS API to initiate a push notification to registered devices when an incident is created
      5. Edit src/js/appConfigExternal.js to specify the Google Project ID obtained in step 5.2 as the 'senderID' for your MBE
      6. Edit src/js/PushClient.js to uncomment lines 108-113
      7. Add the phonegap-plugin-push Cordova plugin to the app and specify the Google Project ID obtained in step 5.2 as the SENDER_ID
      8. If you install v2 of phonegap-plugin-push, you will be required to add the google-service.json file to your Android project and you will be required to install Cocoapods for iOS.
        Refer to the plugin's online documentation for details.  To avoid this, you can install the latest v1 of the plugin instead.
      9. On iOS, build the app using the push-enabled provisioning profile you created in step 5.2

    *Both versions 1.10.5 and 2.0.0 of the phonegap-plugin-push plugin have been tested with Cordova CLI v7.0.1*

6. Build and serve the app
    * To serve web app with fif android theme
      >ojet serve web --theme=fif:android
    * To serve hybrid app with fif theme to iOS simulator
      >ojet serve ios --theme=fif
    * To serve hybrid app with fif theme to Android device
      >ojet serve android --theme=fif --device
    * To serve hybrid app with fif windows theme to browser
      >ojet serve windows --theme=fif --browser
    * To deploy to an iOS device or to deploy in release mode to Android, you will require a buildConfig.xml file that specifies
      your signing credentials.  For more information about this, refer to the JET Developer Guide.

7. Enable and debug service worker (optional)
  a. Enable service worker
    * When running as a web app on browsers that support service worker, the app supports push notification and caching static files offline.
    * Service worker is disabled by default. To enable it, uncomment the service worker code block in index.html.
      /* START: service worker code */
      [code]
      /* END: service worker code */
  b. Debug service worker
    * When the app is served locally and you are working on javascript or css changes, you should force the service worker to always fetch files served from the local server. Otherwise the service worker will load cached js/css and you won’t see your changes. This can be enabled by checking ‘Bypass for network’ in Chrome dev tools > Application tab > Service worker > Bypass for network.
    * To unregister a service worker in Chrome, visit chrome://serviceworker-internals
    * When you are working on the service worker code, you should force the service worker to update on reload. This can be enabled by checking ‘Update on reload’ in Chrome dev tools > Application tab > Service worker > Update on reload.
