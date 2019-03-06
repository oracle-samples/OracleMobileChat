/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
 */
// app configuration for public release

define([], function () {
  return {
    appId: 'com.jet.FixItFast',
    appVersion: '3.0',
    // ReadOnly MBE
    backendName: 'fixitfastclient',
    backendUrl: 'https://mcssvc1dev-mcsidd1.mobileenv.us2.oraclecloud.com:443/mobile/custom/fixitfastclient/',
    backendHeaders: {
      'Oracle-Mobile-Backend-Id': '8b1481b1-0e80-4a24-8d74-b05af753cfe1',
      'Authorization': 'Basic TUNTSUREMV9NQ1NTVkMxREVWX01PQklMRV9BTk9OWU1PVVNfQVBQSUQ6VjNqeWMuNWtxcHRzbWY='
    },
    registrationUrl: 'https://mcssvc1dev-mcsidd1.mobileenv.us2.oraclecloud.com:443/mobile/platform/devices/register',
    senderID: 'XXXXXXX' // Where the XXXXXXX maps to the project number in the Google Developer Console.
  }
})
