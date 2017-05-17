'use strict';
// Configuring the Calendar module
angular.module('calendar', ['ngDialog', 'ui.mask', 'ui.bootstrap', 'ui.calendar', 'ngMaterial']).run(['Menus',
  function(Menus) {
    // Add the calendar dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Calendar',
      state: 'calendar',
      type: 'dropdown',
      roles: ['user', 'user2', 'admin2', 'admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'calendar', {
      title: 'Show Calendar',
      state: 'calendar.list',
      roles: ['user', 'user2', 'admin2', 'admin']
    });
  }
]);



angular.module('calendar').config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourRed', {
      iconclass: "fa fa-square red",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'red');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourRed');
    return taOptions;
  }]);
});

angular.module('calendar').config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourBlue', {
      iconclass: "fa fa-square blue",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'blue');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourBlue');
    return taOptions;
  }]);
});

angular.module('calendar').config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourGreen', {
      iconclass: "fa fa-square green",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'green');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourGreen');
    return taOptions;
  }]);
});

angular.module('calendar').config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourGrey', {
      iconclass: "fa fa-square grey",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'grey');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourGrey');
    return taOptions;
  }]);
});

angular.module('calendar').config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colouryellow', {
      iconclass: "fa fa-square yellow",
      action: function() {
        this.$editor().wrapSelection('forecolor', '#F6911E');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colouryellow');
    return taOptions;
  }]);
});




angular.module('calendar').config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourgreyblue', {
      iconclass: "fa fa-square yellow greyb",
      action: function() {
        this.$editor().wrapSelection('forecolor', '#8496BA');
      }
    });
    // add the button to the default toolbar definition
    taOptions.toolbar[1].push('colourgreyblue');
    return taOptions;
  }]);
});
