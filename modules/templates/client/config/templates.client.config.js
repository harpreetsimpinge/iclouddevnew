'use strict';
// Configuring the Articles module
angular.module('template',['ngDialog','ui.mask','ngMaterial','ngAnimate','ngAria','toastr','daterangepicker','angular.filter','ui.bootstrap','mdPickers','isteven-multi-select','textAngular','ngclipboard']).run(['Menus',
  function (Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Templates',
      state: 'templates',
      type: 'dropdown',
      roles: ['user', 'user2', 'admin2', 'admin']
    });
    

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'templates', {
      title: 'Templates',
      state: 'templates.list',
      roles: ['user', 'user2', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'templates', {
      title: 'Create',
      state: 'templates.create',
      roles: ['user', 'user2', 'admin2', 'admin']
    });
    
  }
]);

// add uiSwitch to module