/**
 * Created by zhangbaoxiang on 16/3/17.
 */
angular.module('myApp')
  .controller('mainMenuCtrl', function ($rootScope, $scope, $state,
                                        $http, $timeout, localStorageTools,
                                        anchorSmoothScroll, $cordovaDatePicker,$cordovaBarcodeScanner,
                                       tipService, roomService, $ionicSideMenuDelegate) {

    //room页面进入前操作,$ionicView.afterEnter页面加载完成调用一个函数
    $scope.$on('$ionicView.afterEnter', function () {
      //初始化筛选时间
      $rootScope.startTime = Date.parse(moment());
      $rootScope.endTime = Date.parse(moment().add(0, 'h'));
      $rootScope.paramsInfo = {
        "start_time" : moment().format(),
        "end_time": moment().add(0,'h').format(),
        "room_name":""
      };
      $rootScope.equipmentInfo = null;
      $rootScope.capacityList = null;
      $rootScope.locationlist=null;
      //选择的房间标识
      $scope.choiceRoom = '';
      //打开App时判断Token是否为空
      if (localStorageTools.get('justmeetingToken') === null || localStorageTools.get('serverInfo') === null) {
        $state.go('login');
      } else {
        tipService.showLoading();
//*************************get请求获得默认的location*************************
        if(!$rootScope.filter.location&&!$rootScope.filter.capacity&&!$rootScope.filter.equipment){
          $http({
            "method":"GET",
            "timeout":30000,
            "headers": {
              'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
              'Content-Type': 'application/json'
            },
            "url":localStorageTools.get('serverInfo')+"/AbpScripts/GetScripts?v=new Date()",
          }).success(function(data){
//***************************将从接口取得的脚本添加到html中**************************************
            var head= document.getElementsByTagName('head')[0];
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.innerHTML= data;
            head.appendChild(script);
            window.abp.setting.values['JustMeeting.Preferences.DefaultLocation']=1;
          }).error(function(){
            //alert("Error");
          });
        }
        //不为空则初始化房间列表
        $http({
          "method":"POST",
          "timeout":30000,
          "headers": {
            'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
            'Content-Type': 'application/json'
          },
          "url":localStorageTools.get('serverInfo')+"/api/services/app/location/GetAll",
        }).success(function(data){
          console.log(data);
          tipService.loadingHide();
          if(data.success == "true" || data.success == true){
            $rootScope.locationlist=data.result.items;
            for(var i in $rootScope.locationlist){
              if($rootScope.locationlist[i].id==window.abp.setting.values['JustMeeting.Preferences.DefaultLocation']){
                $rootScope.default=$rootScope.locationlist[i];
                $rootScope.filter.location=$rootScope.locationlist[i];
              }
            }
            $scope.getAllRoomList();
          }else{
            //tipService.showResponseError(data.error.message);
          }
        }).error(function(err){
          tipService.loadingHide();
          //tipService.showResponseError(err.message);
        });
        if($rootScope.userInfo == null || $rootScope.userInfo == 'null'){
          tipService.showLoading();
          $http({
            "method":"POST",
            "timeout":30000,
            "headers": {
              'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
              'Content-Type': 'application/json'
            },
            "url":localStorageTools.get('serverInfo')+"/api/services/app/session/GetCurrentLoginInformations",

          }).success(function(data){
            tipService.loadingHide();
            if(data.success == "true" || data.success == true){
              $rootScope.userInfo = {
                "userName": data.result.user.userName,
                "name": data.result.user.name,
                "surname": data.result.user.surname,
                "email": data.result.user.emailAddress,
                "tenant":data.result.tenant
                // "tenantName": data.result.tenant.name,
                // "tenancyName": data.result.tenant.tenancyName
              };
              localStorageTools.set('currentUserEmail',$rootScope.userInfo.email);
            }else{
              //tipService.showResponseError(data.error.message);
            }
          }).error(function(err){
            tipService.loadingHide();
            //alert(err.message);
            //tipService.showResponseError(err.message);
          });
        }

        // 显示所有的设备
        if($rootScope.equipmentInfo == null || $rootScope.equipmentInfo== "null"){
          tipService.showLoading();
          $http({
            "method":"POST",
            "timeout":30000,
            "headers": {
              'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
              'Content-Type': 'application/json'
            },
            "url":localStorageTools.get('serverInfo')+"/api/services/app/equipment/GetAll",
          }).success(function(data){
            tipService.loadingHide();
            if(data.success == "true" || data.success == true){
              console.log("所有设备信息:");
              console.log(data.result.items);
              $rootScope.equipmentInfo = data.result.items;
              $rootScope.filter.equipment=$rootScope.equipmentInfo;
              for(var i in $rootScope.equipmentInfo){
                $rootScope.equipmentInfo[i].checked = false;//所有的都是未选择的
              }
            }else{
              //tipService.showResponseError(data.error.message);
            }
          }).error(function(err){
            tipService.loadingHide();
            //tipService.showResponseError(err.message);
          });
        }

        $rootScope.capacityList = [
          {"text": "1","checked":false},
          {"text": "3","checked":false},
          {"text": "4","checked":false},
          {"text": "5","checked":false},
          {"text": "6","checked":false},
          {"text": "10","checked":false},
          {"text": "20","checked":false}
        ];
      }
      $scope.listView = 1;
    });
    //***********************二维码的扫描事件***********************************
    $scope.scanCode=function(){
      // alert(1111);
      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {
          $scope.barcodeData = JSON.parse(barcodeData.text);
          $scope.goRoomDetail($scope.barcodeData.id,$scope.barcodeData.name);
        }, function(error) {
          // An error occurred
        });
    }
    //离开当前页面 保存参数
    $scope.$on('$ionicView.beforeLeave', function () {
      //参数传递通过 rootscope
      $rootScope.paramsInfo.room_name =  $scope.choiceRoom;
      // console.log($rootScope.paramsInfo);
    });

    //地点筛选菜单的显示控制标志位
    $scope.hideLocation = true;
    //人数筛选菜单的显示控制标志位
    $scope.hideCapacity = true;
    //设备筛选菜单的显示控制标志位
    $scope.hideEquipment = true;
    //人数
    //设备列表
    //$scope.equipmentList = [
    //  {"text": "Projector", "checked": false},
    //  {"text": "Phone", "checked": false},
    //  {"text": "Screen", "checked": false},
    //];
    //过滤器对象
    $rootScope.filter = {
      'location': $rootScope.default,
      'capacity': $rootScope.capacityList,
      'equipment': $rootScope.equipmentInfo,
      'isFiltering': false
    };

    //地点筛选菜单的显示控制
    $scope.toShowLocation = function () {
      console.log($rootScope.filter,$rootScope.default);
      $scope.hideLocation = false;
    };
    $scope.toHideLocation = function () {
      $scope.hideLocation = true;
    };
    //人数筛选菜单的显示控制
    $scope.toShowCapacity = function () {
      $scope.hideCapacity = false;
    };
    $scope.toHideCapacity = function () {
      $scope.hideCapacity = true;
    };
    //人数筛选菜单的显示控制
    $scope.toShowEquipment = function () {
      $scope.hideEquipment = false;
    };
    $scope.toHideEquipment = function () {
      $scope.hideEquipment = true;
    };
    //点击SAVE后筛选操作
    $scope.saveFilterInfo = function () {
      console.log("查询时的rootscope");
      console.log($rootScope.paramsInfo);
      $rootScope.filter.equipment = $rootScope.equipmentInfo;
      $rootScope.filter.capacity = $rootScope.capacityList;
      $ionicSideMenuDelegate.toggleRight();
      $rootScope.filter.isFiltering = true;//标志位 标志是进行筛选
      console.log($rootScope.filter.location);
      window.abp.setting.values["JustMeeting.Preferences.DefaultLocation"]=$rootScope.filter.location.id;
      $scope.getAllRoomList();
    }
    /* 获取所有会议室状态 */
    $scope.getAllRoomList = function () {
      tipService.showLoading();
      $http({
        "method": 'POST',
        "timeout":30000,
        "headers": {
          'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
          'Content-Type': 'application/json'
        },
        "url": localStorageTools.get('serverInfo') + "/api/services/app/resource/GetSpaceEventsList",
        "data": {
          "starts": $rootScope.paramsInfo.start_time,
          "ends": $rootScope.paramsInfo.end_time,
          "locationId":$rootScope.filter.location.id
        }
      }).success(function (data) {
        if (data.success === 'true' || data.success === true) {
          $rootScope.building=$rootScope.filter.location.building;
          tipService.loadingHide();
          var roomsEvent=data.result.items;
          $rootScope.roomList=[];
          for(var i in roomsEvent){
            $rootScope.roomList.push(roomsEvent[i].space);
          }
          //过滤会议室
          var filteredRooms = roomService.filteringRoom($rootScope.roomList, $rootScope.filter);
          console.log("过滤后的房间：");
          console.log(filteredRooms);
          //会议室信息列表分组
          $timeout(function () {
            $rootScope.floorList = roomService.groupingRooms(filteredRooms.sort(function(a,b){
              return parseInt(a.floor)-parseInt(b.floor);
            }));//房间根据楼层进行分组
          }, 200);
        } else {
          tipService.loadingHide();
          tipService.showResponseError('Request Error');
          $timeout(function () {
            $state.go('login');
          }, 1000);
        }
      }).error(function (err) {
        //拦截器已经拦截
        //tipService.showResponseError('Request Error');
        //$timeout(function () {
        //  $state.go('login');
        //}, 1000);
      })
        .finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
    };//getAllRoom


    //侧边楼层快速导航
    $scope.findFloor = function (hashKey) {
      anchorSmoothScroll.scrollTo(hashKey, 76);
    };
    /*进入Room详情页面*/
    $scope.goRoomDetail = function (id, name) {
      $scope.choiceRoom = name;
      $rootScope.paramsInfo.room_name =  $scope.choiceRoom;
      $rootScope.current = moment($scope.paramsInfo.start_time).format("YYYY MM DD");
      $state.go('app.index.roomschedule', {id: id, roomName: name});
      // 状态发生变化
    };
    /*查看会议室信息*/
    $scope.changeListview = function (flag) {
      if (flag === 1) {
        $scope.listView = 1;
      } else {
        $scope.listView = 2;
      }
    }
    //打开原生时间选择器
    $scope.openDatepicker = function (type) {
      //选择器配置参数
      console.log(type);
      var options = {
        date: new Date(),
        mode: 'datetime',
        allowOldDates: false,
        allowFutureDates: true,
        doneButtonLabel: 'DONE',
        doneButtonColor: '#000000',
        cancelButtonLabel: 'CANCEL',
        cancelButtonColor: '#000000',
        minuteInterval: 15
      };
      $cordovaDatePicker.show(options).then(function (result) {
              console.log(result+"00000000");
            var newVal = Date.parse(result);
            //type 区分开始时间和结束时间
            if (type == 1) {
              $rootScope.startTime = newVal;
              $rootScope.paramsInfo.start_time = moment(newVal).format();
            } else {
              $rootScope.endTime = newVal;
              $rootScope.paramsInfo.end_time = moment(newVal).format();
            }
          },
          function (err) {
            console.log(err);
          }
        );
    };//EOF 打开时间选择

  });//EOF of controller
