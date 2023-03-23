# Oracle Mobile Chat

## Installation
-----------------------------------

*This sample application is intended to illustrate the use of Chat REST APIs for [Oracle Service Cloud ](https://docs.oracle.com/en/cloud/saas/service/19a/cxscc/toc.htm) and [Oracle Engagement Cloud ](https://docs.oracle.com/en/cloud/saas/engagement/19a/facoe/index.html). These APIs can be used to build custom chat interfaces for web and mobile apps. It is built using [Oracle JET](https://www.oracle.com/webfolder/technetwork/jet/index.html). To take complete advantage of this sample application, please follow the additional installation instructions below.*

1. Prerequisites 
    1.  Install node.js (8.x) and npm by going to [Nodejs](https://nodejs.org/en/)
    2.  Download and install python (2.x) from [Python](https://www.python.org/)
    3.  Install [Oracle OJET CLI](https://www.oracle.com/webfolder/technetwork/jet/index.html)
        >npm install -g @oracle/ojet-cli
    4.  Install [Oracle OJET tooling](https://www.oracle.com/webfolder/technetwork/jet/index.html)
        >npm install -g @oracle/oraclejet-tooling
    5.  Install [Cordova](https://cordova.apache.org/) 
        >npm install -g cordova
    6.  Install [node-gyp](https://github.com/nodejs/node-gyp)
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

5. Build and serve the app
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

6. (Optional) For details on Enabling a full access backend, Enabling push notifications or Enabling and Debugging service worker, please refer to original [FixItFast](https://www.oracle.com/webfolder/technetwork/jet-420/globalExamples-App-FixItFast.html) app

## Contributing

This project is not accepting external contributions at this time. For bugs or enhancement requests, please file a GitHub issue unless it’s security related. When filing a bug remember that the better written the bug is, the more likely it is to be fixed. If you think you’ve found a security vulnerability, do not raise a GitHub issue and follow the instructions in our [security policy](./SECURITY.md).

## Security

Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

## License

Copyright (c) 2018, 2023 Oracle and/or its affiliates.

Released under the Universal Permissive License v1.0 as shown at
<https://oss.oracle.com/licenses/upl/>.
