'use strict';
// Configuring the library module
angular.module('library',['ngDialog','ui.mask','ngMaterial']).run(['Menus',
  function (Menus) {
    // Add the library dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Library',
      state: 'library',
      type: 'dropdown',
      roles: ['user2', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'library', {
      title: 'Show library',
      state: 'library.list',
      roles: ['user2', 'admin2', 'admin']
    });
  }
]);
