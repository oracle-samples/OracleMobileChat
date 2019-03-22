/*
** Oracle Mobile Chat version 1.0.
**
** Copyright © 2019 Oracle Corp.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at http://oss.oracle.com/licenses/upl.
*/
({
  baseUrl: "js",
  appDir: "../",
  dir: "rjs_built",
  bundlesConfigOutFile: 'js/main.js',
  modules: [
    {
      name: "rjs_bundles/listBundle",
      create: true,
      include: ['ojs/ojswipetoreveal', 'ojs/ojoffcanvas', 'ojs/ojpulltorefresh', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
      exclude: ['jquery']
    }
  ],
  paths:
  //injector:mainReleasePaths
  {
  },
  //endinjector
  optimize: "none"
})
