/**
 * Created by zhangbaoxiang on 16/3/31.
 */
angular.module('myApp')
  .controller('roomScheduleCtrl', function ($rootScope, $scope, $state, $stateParams, $timeout, $http,anchorSmoothScroll, scheduleTools, localStorageTools, tipService, ionicDatePicker, timelineData) {
    $scope.$on('$ionicView.afterEnter', function () {
      //初始化头部
      $scope.current = moment($rootScope.paramsInfo.start_time);
      //*******************现在当前的时间*************************
      $scope.headerDate = $scope.current.format('MMM DD YYYY ddd');
      $scope.timeData = timelineData;
      $scope.roomTitle = $rootScope.paramsInfo.room_name;
      //初始化Schedule
      $scope.showRoomSchedule = true;
      if ($scope.current.format('YYYY MM DD') === moment().format('YYYY MM DD') && $scope.current.hours() < 19) {
        $scope.showLine = true;
      } else {
        $scope.showLine = false;
      }
      //请求会议室今天所有的会议
      $scope.getMeetingsByRoom();
    });
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
      var newStarts = moment($scope.current).hour(7).minute(0).second(0).add(e.target.offsetTop, 'm');
      if (moment() > newStarts) {
        tipService.showResponseError("Time invalid. Please verify the date and time.");
        return;
      }
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
          $scope.evs[i].starts = newStarts.format('YYYY-MM-DDTHH:mm:ss');
          $scope.evs[i].ends = newEnds.format('YYYY-MM-DDTHH:mm:ss');
          $scope.evs[i] = scheduleTools.setBlockPosition($scope.evs[i]);
          flag = true;
        }
      }
      if (!flag) {
        $scope.evs.push(newEvent);
      }
    };

    //*************************请求会议室所有事件***********************************
    $scope.getMeetingsByRoom = function () {
      //处理当前时间标识线
      if ($scope.current.format('YYYY MM DD') === moment().format('YYYY MM DD') && $scope.current.hours() < 19) {
        $scope.showLine = true;
      } else {
        $scope.showLine = false;
      }
      console.log($stateParams);
      console.log("=========");
      tipService.showLoading();
      $http({
        "method": 'POST',
        "headers": {
          'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
          'Content-Type': 'application/json'
        },
        "url": localStorageTools.get('serverInfo') + '/api/services/app/resource/GetEvents',
        "data": {
          "starts": moment($scope.current).hour(0).minute(0).second(0).format(),
          "ends": moment($scope.current).add(1, 'd').hour(0).minute(0).second(0).format(),
          "id": $stateParams.id
        }
      }).success(function (data) {
        tipService.loadingHide();
        anchorSmoothScroll.scrollTo('currentline', 180);
        console.log('刷新页面成功!!');
        if (data.success === 'true' || data.success === true) {
          $scope.evs = scheduleTools.dealEvent(data.result.items);
          for (var i in $scope.evs) {
            $scope.evs[i] = scheduleTools.setBlockPosition($scope.evs[i]);
          }
          if ($scope.current.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {

            var newStarts = moment().second(0);
            if (newStarts.minute() % 15 !== 0) {
              newStarts = newStarts.add(15 - newStarts.minute() % 15, 'm');
            }
            var newEnds = moment(newStarts).add(60, 'm');
          }
        } else {
          tipService.showResponseError('Request Error');
          $timeout(function () {
            $state.go('login');
          }, 1000);
        }
      });
    };
    //********************切换日期（也会请求该会议室的所有会议）***********************
    $scope.changeDate = function (val) {
      console.log('切换时间')
      $scope.current = moment($scope.current).add(val, 'd');
      if ($scope.current.date() != moment().date()) {
        $scope.showLine = false;
      } else {
        $scope.showLine = true;
      }
      $rootScope.current = moment($scope.current).format("YYYY MM DD");
      $scope.headerDate = $scope.current.format('MMM DD YYYY ddd');
      $scope.getMeetingsByRoom();
    }
    //********************弹出日期选择**********************************
    $scope.showDatePicker = function () {
      var ipObj1 = {
        callback: function (val) {  //Mandatory
          $timeout(function () {
            console.log('时间切换成功:', new Date(val));
            $scope.current = moment(val);
            $scope.headerDate = $scope.current.format('MMM DD YYYY ddd');
            $scope.getMeetingsByRoom();
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
    };

    //离开页面
    $scope.$on('$ionicView.beforeLeave', function () {
      $rootScope.paramsInfo.start_time = $scope.current;
      $rootScope.paramsInfo.evs = $scope.evs;
    });
    //**********************刷新页面********************
    $scope.refreshMeetingInfo = function () {
      //处理当前时间标识线
      if ($scope.current.format('YYYY MM DD') === moment().format('YYYY MM DD') && $scope.current.hours() < 19) {
        $scope.showLine = true;
      } else {
        $scope.showLine = false;
      }
      console.log("**************刷新页面********************");
      console.log($stateParams);
      tipService.showLoading();
      $http({
        "method": 'POST',
        "headers": {
          'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
          'Content-Type': 'application/json'
        },
        // 接口不知道换哪个
        "url": localStorageTools.get('serverInfo') + '/api/services/app/resource/GetEvents',
        "data": {
          "starts": moment($scope.current).hour(0).minute(0).second(0).format(),
          "ends": moment($scope.current).add(1, 'd').hour(0).minute(0).second(0).format(),
          "id": $stateParams.id
        }
      }).success(function (data) {
          $timeout(function(){
            tipService.loadingHide();
            anchorSmoothScroll.scrollTo('currentline',180);
          },2000);
          console.log('get events success!!');
          if (data.success === 'true' || data.success === true) {
            $scope.evs = scheduleTools.dealEvent(data.result.items);
            console.log("ggggggggg");
            console.log($scope.evs);
            for (var i in $scope.evs) {
              $scope.evs[i] = scheduleTools.setBlockPosition($scope.evs[i]);
            }
            if ($scope.current.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {

              var newStarts = moment().second(0);
              if (newStarts.minute() % 15 !== 0) {
                newStarts = newStarts.add(15 - newStarts.minute() % 15, 'm');
              }
              var newEnds = moment(newStarts).add(60, 'm');
              //$scope.evs.push(setNewEvent(newStarts, newEnds));
            }
          } else {
            tipService.showResponseError('Request Error');
            $timeout(function () {
              $state.go('login');
            }, 1000);
          }
        })
        .error(function () {
          tipService.showResponseError('Server Error');
          $timeout(function () {
            $state.go('login');
          }, 1000);
        })
        .finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
    }

  });
