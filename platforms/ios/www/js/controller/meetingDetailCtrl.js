/**
 * Created by zhangbaoxiang on 16/3/17.
 */
angular.module('myApp')
  .controller('meetingDetailCtrl', function ($rootScope,$filter, $scope,$sce,$http, $state, $stateParams,ionicDatePicker, $timeout,$ionicModal,scheduleTools, localStorageTools,anchorSmoothScroll,tipService,timelineData,modalService) {

    $scope.$on('$ionicView.afterEnter',function(){
      console.log($rootScope);
      $scope.meetingInfo = $rootScope.meetingInfo;
      console.log("*************会议的整个具体情况*************");
      console.log($rootScope.meetingInfo);
      $scope.meetingInfo.roomName = $rootScope.paramsInfo.room_name;
      $scope.meetingInfo.content = $rootScope.meetingInfo.content;
      $scope.current = $rootScope.paramsInfo.start_time;
      $scope.evs = $rootScope.paramsInfo.evs;
      $scope.timeData = timelineData;
      $scope.showSaveBtn = true;
      $scope.peopleList = [];
      $scope.inviteeList = $scope.meetingInfo.invitees;
      $scope.contact = {
        'Email':""
      } ;
      tipService.showLoading();
      $http({
        "method":"POST",
        "headers": {
          'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
          'Content-Type': 'application/json',
          'Abp.TenantId': localStorageTools.get('tenantId')
        },
        "url":localStorageTools.get('serverInfo')+"/api/services/app/user/GetAll"
      }).then(function success(res){
        tipService.loadingHide();
        if(res.data.success == true || res.data.success == "true"){
          $scope.peopleList = res.data.result.items;
        }else{
          tipService.showResponseError('Request Error');
          $timeout(function(){
            $ionicHistory.goBack(-1);
          },1000);
        }
      },function error(res){
        tipService.showResponseError(res.data.error.message);
      });
    });
    //****************************删除会议和更新会议******************************
    $scope.toDelete = function(){
      modalService.showDeleteConfirm($scope);
    };
    $scope.toSave = function(){
      modalService.showSaveConfirm($scope);
    };
    /******************************people Modal******************************************/
    $scope.openPeopleModal = function () {
      //初始化Modal----people
      $ionicModal.fromTemplateUrl('templates/modal/people_view.html', {
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
                'Content-Type': 'application/json',
                'Abp.TenantId': localStorageTools.get('tenantId')
              },
              "url":localStorageTools.get('serverInfo')+"/api/services/app/user/FindContacts",
              "data":{
                "keyword":$scope.contact.Email
              }
            }).then(function success(res){
              tipService.loadingHide();
              if(res.data.success == true || res.data.success == "true"){
                $scope.showInviteeList = res.data.result.items;
              }else{
                tipService.showResponseError('Request Error');
                $timeout(function(){
                  $ionicHistory.goBack(-1);
                },1000);
              }
            },function error(res){
              tipService.showResponseError(res.data.error.message);
            });
          },1000);
        }

        $scope.addContact = function(){
          var reg = /\S+@\S+\.\S+/;
          if(reg.test($scope.contact.Email)){
            var newInivtee = {
              'userId':null,
              'surname':null,
              'givenName':$scope.contact.Email.split('@')[0],
              'emailAddress':$scope.contact.Email
            }
            var boo2=false;//没有重复的
            for(var i in $scope.inviteeList){
              if($scope.inviteeList[i].givenName===newInivtee.givenName&&$scope.inviteeList[i].emailAddress===newInivtee.emailAddress){
                boo2=true;
                break;
              }
            }
            if(!boo2){
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

    //***********************出现日历**********************
    $scope.showDatePicker=function(){
      var ipObj1 = {
        callback: function (val) {
          $timeout(function () {
            $rootScope.current = moment(val).format("YYYY MM DD");
            $scope.lindian=moment($rootScope.meetingInfo.starts).hour(0).minute(0).second(0).toDate();
            $scope.startMs=$rootScope.meetingInfo.starts.getTime()-$scope.lindian.getTime();
            $scope.endMs=$rootScope.meetingInfo.ends.getTime()-$scope.lindian.getTime();
            $scope.meetingInfo.starts = new Date(val+$scope.startMs);
            $scope.meetingInfo.ends=new Date(val+$scope.endMs);
            $http({
              "method": 'POST',
              "timeout":30000,
              "headers": {
                'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
                'Content-Type': 'application/json',
                'Abp.TenantId': localStorageTools.get('tenantId')
              },
              "url": localStorageTools.get('serverInfo') + "/api/services/app/resource/GetEvents",
              "data": {
                "starts": moment($scope.meetingInfo.starts).hour(0).minute(0).second(0).format(),
                "ends": moment($scope.meetingInfo.starts).add(1, 'd').hour(0).minute(0).second(0).format(),
                "id":$stateParams.id
              }
            }).then(function success(res){
              tipService.loadingHide();
              anchorSmoothScroll.scrollTo('currentline', 180);
              if(res.data.success === 'true' || res.data.success === true) {
                $scope.evs = scheduleTools.dealEvent(res.data.result.items);
                for (var i in $scope.evs) {
                  $scope.evs[i] = scheduleTools.setBlockPosition($scope.evs[i]);
                }
              }
            },function error(res){
            });
          }, 100);
        },
        from: new Date(2011, 1, 1),
        to: new Date(2031, 12, 31),
        inputDate: new Date($scope.current),
        mondayFirst: false,
        disableWeekdays: [],
        closeOnSelect: false,
        templateType: 'popup'
      };
      ionicDatePicker.openDatePicker(ipObj1);
    }
    $scope.openTimeModal = function () {
      tipService.showRoomSchedule($scope);
    };
    $scope.hideTimeModal = function () {
      tipService.loadingHide();
      $scope.meetingInfo.starts=$scope.evs[$scope.evs.length-1].starts;
      $scope.meetingInfo.ends=$scope.evs[$scope.evs.length-1].ends;
      $scope.meetingInfo.duration=($scope.meetingInfo.ends.getTime()-$scope.meetingInfo.starts.getTime())/3600000;
    }
    //*********************设置新的事件方法****************************
    function setNewEvent(starts, ends) {
      if (ends.hour() >= 19) {
        ends.hour(19).minute(0).second(0);
      }
      var newEvent = {
        starts: starts.format('YYYY-MM-DDTHH:mm:ss'),
        ends: ends.format('YYYY-MM-DDTHH:mm:ss'),
        title: 'NEW RESERVATION',
        id: 'NEW RESERVATION',
        creator: {
          emailAddress: localStorageTools.get('currentUserEmail'),
        },
        $count: 1,
        $inner: false,
        $sorder: 0,
        $isNew: true,
        $isEdit: true,
        $evs: $scope.evs,
      }
      newEvent = scheduleTools.setBlockPosition(newEvent);
      return newEvent;
    }
    $scope.createNewEventBlock = function (event) {
      var e = event || window.event;
      //如果点击到时间标签
      if (e.target.localName == 'span') {
        return;
      }
      var newStarts = moment($scope.meetingInfo.starts).hour(7).minute(0).second(0).add(e.target.offsetTop, 'm');
      var newEnds = moment(newStarts).add(60, 'm');
      var flag = false;
      var newEvent = setNewEvent(newStarts, newEnds);
      for (var i in $scope.evs) {
        //判断是否存在可修改的块
        if ($scope.evs[i].$isEdit) {
          var duration = parseInt($scope.evs[i].height);
          var newEnds = moment(newStarts).add(duration, 'm');
          if (newEnds.hour() >= 19) {
            newEnds.hour(19).minute(0).second(0);
          }
          $scope.evs[i].starts = newEnds.format();
          $scope.evs[i].ends = newEnds.format();
          $scope.evs[i] = scheduleTools.setBlockPosition($scope.evs[i]);

          flag = true;
        }
      }
      if (!flag) {
        $scope.evs.push(newEvent);
      }
    }

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
  });
