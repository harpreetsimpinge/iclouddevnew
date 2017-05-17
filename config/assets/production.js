'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/components-font-awesome/css/font-awesome.css',
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/angular-ui-switch/angular-ui-switch.css',
        'public/lib/ng-dialog/css/ngDialog.css',
        'public/lib/ng-dialog/css/ngDialog-theme-default.css',
        'public/lib/fullcalendar/dist/fullcalendar.css',
        'public/lib/angular-material/angular-material.css',
        'public/lib/bootstrap-toggle/css/bootstrap-toggle2.css',
        'public/lib/angular-toastr/dist/angular-toastr.css',
        'public/lib/bootstrap-daterangepicker/daterangepicker.css',
        'public/lib/angular-bootstrap/ui-bootstrap-csp.css',
        'public/lib/mdPickers/dist/mdPickers.css',
        'public/lib/isteven-angular-multiselect/isteven-multi-select.css',
        'public/lib/textAngular/dist/textAngular.css'
        
      ],
      js: [
        'public/lib/jquery/dist/jquery.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-ui-switch/angular-ui-switch.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/ng-dialog/js/ngDialog.js',       
        'public/lib/moment/moment.js',
        'public/lib/fullcalendar/dist/fullcalendar.js',
        'public/lib/angular-ui-calendar/src/calendar.js', 
        'public/lib/angular-material/angular-material.js', 
        'public/lib/angular-aria/angular-aria.js', 
        'public/lib/bootstrap/dist/js/bootstrap.js',
        'public/lib/fastclick/lib/fastclick.js', 
        'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
        'public/lib/bootstrap-daterangepicker/daterangepicker.js', 
        'public/lib/angular-daterangepicker/js/angular-daterangepicker.js',
        'public/lib/angular-smart-table/js/smart-table.js',
        'public/lib/angular-filter/dist/angular-filter.js',
        'public/lib/mdPickers/dist/mdPickers.js',
        'public/lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
        'public/lib/jspdf/dist/jspdf.debug.js',
        'public/lib/html2canvas/build/html2canvas.js',
        'public/lib/isteven-angular-multiselect/isteven-multi-select.js',
        'public/lib/textAngular/dist/textAngular-rangy.min.js',
        'public/lib/textAngular/dist/textAngular-sanitize.min.js',
        'public/lib/textAngular/dist/textAngular.min.js',
        'public/lib/clipboard/dist/clipboard.js',
        'public/lib/ngclipboard/dist/ngclipboard.js'
        


      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css',
      'modules/articles/client/css/style.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
