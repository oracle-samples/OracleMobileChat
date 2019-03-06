/**
 * @license
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * The Universal Permissive License (UPL), Version 1.0
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
    },
    {
      name: "rjs_bundles/mapviewBundle",
      create: true,
      include: ['oraclemapviewer', 'oracleelocation'],
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
