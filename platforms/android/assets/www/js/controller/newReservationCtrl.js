/**
 * Created by zhangbaoxiang on 16/5/13.
 */
angular.module('myApp')
  .controller('newReservationCtrl', function ($rootScope, $scope, $http, $state,$filter,ionicDatePicker, tipService, timelineData, localStorageTools, $stateParams, $timeout,$ionicHistory,$ionicModal) {
    $scope.$on('$ionicView.afterEnter', function () {
      console.log("rootScope的内容:");
      console.log($rootScope.paramsInfo);
      console.log($rootScope.meetingInfo);
      $scope.newEvent = $rootScope.evInfo;
      $scope.newEvent.roomName = $rootScope.paramsInfo.room_name;
      $scope.evs = $rootScope.paramsInfo.evs;
      $scope.timeData = timelineData;
      $scope.current = $rootScope.paramsInfo.start_time;

      $scope.peopleList = [];
      $scope.inviteeList = [];
      $scope.contact = {
        'Email':""
      } ;

      tipService.showLoading();
      $http({
        "method":"POST",
        "headers": {
          'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
          'Content-Type': 'application/json'
        },
        "url":localStorageTools.get('serverInfo')+"/api/services/app/user/GetAll"
      }).success(function(data){
        tipService.loadingHide();
        if(data.success == true || data.success == "true"){
          $scope.peopleList = data.result.items;
        }else{
          tipService.showResponseError('Request Error');
          $timeout(function(){
            $ionicHistory.goBack(-1);
          },1000);
        }
      }).error(function(err){
        tipService.showResponseError(err.msg);
      });
    });
    //***********************预订会议*****************************
    $scope.toBooking = function () {
      if ($scope.newEvent.subject == '' || $scope.newEvent.subject == null) {
        tipService.showResponseError('Please Input Your Subject');
        return;
      } else {
        console.log($stateParams);
        console.log('newEvent:');
        console.log($scope.newEvent);
        console.log('invitee:');
        console.log($scope.inviteeList);
        tipService.showLoading();
        $http({
          'method': 'POST',
          "headers": {
            'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
            'Content-Type': 'application/json'
          },
          'url': localStorageTools.get('serverInfo')+'/api/services/app/schedule/CreateEvent',
          'data': {
            "starts": moment($scope.newEvent.starts).format(),
            "ends": moment($scope.newEvent.ends).format(),
            "resourceId": parseInt($stateParams.id),
            "invitees":$scope.inviteeList,
            "title": $scope.newEvent.subject,
            "content": $scope.newEvent.note
          }
        }).success(function (data) {
          tipService.loadingHide();
          if (data.success === 'true' || data.success === true) {
            tipService.submitSuccess('Your reservation has been submitted. Pull down to refresh. ');
          } else {
            tipService.showResponseError("Request Error222");

            $timeout(function () {
              $state.go('login');
            }, 1000);
          }

        }).error(function (err) {
          tipService.showResponseError("Request Error");
          $timeout(function () {
            $state.go('login');
          }, 1000);
        });
      }

    };
    $scope.openTimeModal = function () {
      tipService.showRoomSchedule($scope);
    };
    $scope.hideTimeModal = function () {
      tipService.loadingHide();
      $scope.newEvent.duration=($scope.newEvent.ends.getTime()-$scope.newEvent.starts.getTime())/3600000;
    }


    /*-----------------------------people Modal------------------------------*/
    $scope.openPeopleModal = function () {
      //初始化Modal----people
      $ionicModal.fromTemplateUrl('templates/modal/people.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {

        $scope.peopleModal = modal;
        $scope.peopleModal.show();

        //初始化搜素提示卡
        $scope.isShowCard = false;
        $scope.showInviteeList = [];
        $scope.addPeopleToList = function (people) {
          document.getElementById("search").value="";
          var foo=false;//没有重复的
          for(var i in $scope.inviteeList){
            if($scope.inviteeList[i].givenName===people.givenName&&$scope.inviteeList[i].emailAddress===people.emailAddress){
              foo=true;
              break;
            }
          }
          if(!foo){
            $scope.inviteeList.push(people);
          }
        };
        var timer;
        $scope.filterContact=function(){
          clearTimeout(timer);
          timer=setTimeout(function(){
            if($scope.contact.Email==""){
              return;
            }
            $http({
              "method":"POST",
              "headers": {
                'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
                'Content-Type': 'application/json'
              },
              "url":localStorageTools.get('serverInfo')+"/api/services/app/user/FindContacts",
              "data":{
                "keyword":$scope.contact.Email
              }
            }).success(function(data){
              tipService.loadingHide();
              if(data.success == true || data.success == "true"){
                $scope.showInviteeList = data.result.items;
                console.log($scope.showInviteeList);
              }else{
                tipService.showResponseError('Request Error');
                $timeout(function(){
                  $ionicHistory.goBack(-1);
                },1000);
              }
            }).error(function(err){
              tipService.showResponseError(err.msg);
            });
          },1000);
        }
        //********************添加参加会议的人员*************************
        $scope.addContact = function(){
          //var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
          var reg = /\S+@\S+\.\S+/;
          if(reg.test($scope.contact.Email)){
            var newInivtee = {
              'userId':null,
              'surname':null,
              'givenName': $scope.contact.Email.split('@')[0],
              'emailAddress':$scope.contact.Email,
            }
            var boo=false;//没有重复的
            for(var i in $scope.inviteeList){
              if($scope.inviteeList[i].givenName===newInivtee.givenName&&$scope.inviteeList[i].emailAddress===newInivtee.emailAddress){
                boo=true;
                break;
              }
            }
            if(!boo){
              $scope.inviteeList.push(newInivtee);
            }
          }else{
            tipService.showResponseError("Please input a valid E-mail");
          }
          document.getElementById("search").value="";
        };


      });
      $scope.hidePeopleModal = function () {
        $scope.peopleModal.remove();
      };
    };

    // $scope.showDatePicker = function () {
    //   var ipObj1 = {
    //     callback: function (val) {  //Mandatory
    //       $timeout(function () {
    //         console.log('时间切换成功:', new Date(val));
    //         $scope.current = moment(val);
    //         $scope.headerDate = $scope.current.format('MMMM DD YYYY');
    //       }, 100);
    //     },
    //     from: new Date(2011, 1, 1),
    //     to: new Date(2031, 12, 31),
    //     inputDate: new Date($scope.current),
    //     mondayFirst: false,
    //     disableWeekdays: [],
    //     closeOnSelect: false,
    //     templateType: 'popup'
    //   };
    //   ionicDatePicker.openDatePicker(ipObj1);
    // };

  })
  .filter("connectFilter",function(){
    return function (list,params){
      var result = []
      for(var i in list){
        if(JSON.stringify(list[i]).toUpperCase().indexOf(params.toUpperCase()) > 0){
          result.push(list[i]);
        }
      }

      return result;
    }
  })

;
