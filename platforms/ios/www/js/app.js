// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('myApp', ['ionic', 'ui.router', 'ngCordova', 'appService', 'myDirective', 'ionic-datepicker'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      console.log("app is ready!");
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

    });
  })

  .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {


    $ionicConfigProvider.platform.android.tabs.style("standard");
    $ionicConfigProvider.platform.android.tabs.position("bottom");
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.views.swipeBackEnabled(false);
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/index');
    // 直接进入首页

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        views: {
          '': {
            templateUrl: 'templates/sideMenu.html',
            //controller: 'mainMenuCtrl'
          }
        }
      })

      /* app登录入口 */
      .state('login', {
        url: '/login',
        views: {
          '': {
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
          }
        },
      })

      /* app登录后会议室主页 */
      .state('app.index', {
        url: '/index',
        cache: 'false',
        views: {
          'tab-Room': {
            templateUrl: 'templates/room.html',
            controller: 'mainMenuCtrl'
          }
        },
      })
      /* 日程主页 */
      .state('app.schedule', {
        url: '/schedule',
        views: {
          'tab-Calendar': {
            templateUrl: 'templates/schedule.html',
            controller: 'scheduleCtrl'
          }
        },
      })
      /* 用户主页 */
      .state('app.account', {
        url: '/account',
        views: {
          'tab-Account': {
            templateUrl: 'templates/account.html',
            controller: 'accountCtrl'
          }
        },
      })
      .state('app.map', {
        url: '/map',
        cache: 'false',
        views: {
          'tab-Location': {
            templateUrl: 'templates/map.html',
            controller: 'mapCtrl'
          }
        }
      })

      /* 当有会议时进行的是会议详情*/
      .state('app.index.meetingDetail', {
        url: '/meetingDetailCtrl/:id',
        views: {
          'tab-Room@app': {
            templateUrl: 'templates/meetingDetail.html',
            controller: 'meetingDetailCtrl'
          }
        }
      })
      /* 没有会议要进行新会议*/
      .state('app.index.newReservation', {
        url: '/newReservation/:id',
        views: {
          'tab-Room@app': {
            templateUrl: 'templates/newReservation.html',
            controller: 'newReservationCtrl'
          }
        }
      })

      /*会议室日程*/
      .state('app.index.roomschedule', {
        url: '/roomSchedule/:id?roomName',
        views: {
          'tab-Room@app': {
            templateUrl: "templates/roomSchedule.html",
            controller: 'roomScheduleCtrl'
          }
        }
      })

    ;//state's ;

  }])
  .config(function ($ionicConfigProvider, ionicDatePickerProvider) {

    var datePickerObj = {
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      mondayFirst: false,
      inputDate: new Date(),
      weeksList: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      templateType: 'popup',
      showTodayButton: true,
      dateFormat: 'dd MMM yyyy',
      closeOnSelect: false,
      from: new Date(2015, 8, 1)
    };

    ionicDatePickerProvider.configDatePicker(datePickerObj);

    $ionicConfigProvider.tabs.position('bottom');

  })
  .factory('MyInterceptor', ['$q','localStorageTools','$location', function ($q,localStorageTools,$location) {

  return {
    // 可选，拦截成功的请求
    request: function (config) {
      // 进行预处理
      config.headers['Authorization'] = 'Bearer ' + localStorageTools.get('justmeetingToken');
      config.headers['Content-Type'] = 'application/json';
      config.headers['Abp.TenantId']=localStorageTools.get('tenantId');
      return config;
    },
    //响应失败
    responseError: function (rejection) {
      if(rejection.status===401){
        if(rejection.data.unAuthorizedRequest){
          $location.path("/login");
        }
      }
      if(rejection.status===401){
        $location.path("/login");
      }
      return $q.reject(rejection);
    }
  };
}]).config(function ($httpProvider) {
  $httpProvider.interceptors.push("MyInterceptor");
});

