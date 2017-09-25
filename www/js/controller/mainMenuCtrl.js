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
      if(localStorageTools.get("num")){
        var num=JSON.parse(localStorageTools.get("num"));
        for(var i in num){
          if(num[i].checked==true){
            $rootScope.isDisabled=true;
            break;
          }else{
            $rootScope.isDisabled=false;
          }
        }
      }
      //打开App时判断Token是否为空
      if (localStorageTools.get('justmeetingToken') === null || localStorageTools.get('serverInfo') === null) {
        $state.go('login');
      } else {
        tipService.showLoading();
        //if(!$rootScope.filter.location||!$rootScope.filter.capacity||!$rootScope.filter.equipment){
        // 显示所有的设备
        if($rootScope.equipmentInfo == null || $rootScope.equipmentInfo== "null"){
          tipService.showLoading();
          $http({
            "method":"POST",
            "timeout":30000,
            "headers": {
              'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
              'Content-Type': 'application/json',
              'Abp.TenantId': localStorageTools.get('tenantId')
            },
            "url":localStorageTools.get('serverInfo')+"/api/services/app/equipment/GetAll",
          }).then(function success(res){
            tipService.loadingHide();
            if(res.data.success == "true" || res.data.success == true){
              $rootScope.equipmentInfo = res.data.result.items;
              $rootScope.filter.equipment=$rootScope.equipmentInfo;
              for(var i in $rootScope.equipmentInfo){
                $rootScope.equipmentInfo[i].checked = false;//所有的都是未选择的
              }
            }
          },function error(res){
            tipService.loadingHide();
          });
        }
        //}
        //不为空则初始化房间列表
        $http({
          "method":"POST",
          "timeout":30000,
          "headers": {
            'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
            'Content-Type': 'application/json',
            'Abp.TenantId': localStorageTools.get('tenantId')
          },
          "url":localStorageTools.get('serverInfo')+"/api/services/app/location/GetAll",
        }).then(function success(res){
          tipService.loadingHide();
          if(res.data.success == "true" || res.data.success == true){
            $rootScope.locationlist=res.data.result.items;
            for(var i in $rootScope.locationlist){
              if(localStorageTools.get("selectedId")==null){
                $rootScope.default=$rootScope.locationlist[0];
                $rootScope.filter.location=$rootScope.locationlist[0];
              }else{
                $rootScope.default=JSON.parse(localStorageTools.get("selectedId"));
                $rootScope.filter.location=JSON.parse(localStorageTools.get("selectedId"));
              }
            }
            $scope.getAllRoomList();
          }
        },function error(res){
          tipService.loadingHide();
        });
        if($rootScope.userInfo == null || $rootScope.userInfo == 'null'){
          tipService.showLoading();
          $http({
            "method":"POST",
            "timeout":30000,
            "headers": {
              'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
              'Content-Type': 'application/json',
              'Abp.TenantId': localStorageTools.get('tenantId')
            },
            "url":localStorageTools.get('serverInfo')+"/api/services/app/session/GetCurrentLoginInformations",

          }).then(function success(res){
            tipService.loadingHide();
            if(res.data.success == "true" || res.data.success == true){
              $rootScope.userInfo = {
                "userName": res.data.result.user.userName,
                "name": res.data.result.user.name,
                "surname": res.data.result.user.surname,
                "email": res.data.result.user.emailAddress,
                "tenant":res.data.result.tenant
              };
              localStorageTools.set('currentUserEmail',$rootScope.userInfo.email);
            }
          },function error(res){
            tipService.loadingHide();
          });
        }
        $rootScope.capacityList = [
          {"text": "1-3","checked":false},
          {"text": "3-5","checked":false},
          {"text": "6-10","checked":false},
          {"text": "11-15","checked":false},
          {"text": "16-20","checked":false},
          {"text": "20-25","checked":false},
          {"text": "26+","checked":false}
        ];
      }
    });
    //***********************二维码的扫描事件***********************************
    $scope.scanCode=function(){
      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {
          $scope.barcodeData = JSON.parse(barcodeData.text);
          $scope.goRoomDetail($scope.barcodeData.id,$scope.barcodeData.name);
        }, function(error){});
    }
    //离开当前页面 保存参数
    $scope.$on('$ionicView.beforeLeave', function () {
      //参数传递通过 rootscope
      $rootScope.paramsInfo.room_name =  $scope.choiceRoom;
    });

    //地点筛选菜单的显示控制标志位
    $scope.hideLocation = true;
    //人数筛选菜单的显示控制标志位
    $scope.hideCapacity = true;
    //设备筛选菜单的显示控制标志位
    $scope.hideEquipment = true;
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

    $scope.toHideEquipment2 = function () {
      $scope.hideEquipment = true;
      $rootScope.filter.equipment = $rootScope.equipmentInfo;
      $rootScope.state=$rootScope.filter.equipment;
      localStorageTools.set("state",JSON.stringify($rootScope.state));
      var state=JSON.parse(localStorageTools.get("state"));
      var num=JSON.parse(localStorageTools.get("num"));
      var boo1,boo2;
      if(state&&num){
        for(var i in state){
          if(state[i].checked==true){
            boo1=true;
            break;
          }else{
            boo1=false;
          }
        }
        for(var i in num){
          if(num[i].checked==true){
            boo2=true;
            break;
          }else{
            boo2=false;
          }
        }
      }else{
        for(var i in state){
          if(state[i].checked==true){
            boo1=true;
            break;
          }else{
            boo1=false;
          }
        }
      }
      public(boo1,boo2);
    };
    $scope.toHideCapacity2=function(){
      $scope.hideCapacity = true;
      $rootScope.filter.capacity = $rootScope.capacityList;
      localStorageTools.set("num",JSON.stringify($rootScope.filter.capacity));
      var num=JSON.parse(localStorageTools.get("num"));
      var state=JSON.parse(localStorageTools.get("state"));
      var boo1,boo2;
      if(num&&state){
        for(var i in num){
          if(num[i].checked==true){
            boo1=true;
            break;
          }else{
            boo1=false;
          }
        }
        for(var i in state){
          if(state[i].checked==true){
            boo2=true;
            break;
          }else{
            boo2=false;
          }
        }
      }else{
        for(var i in num){
          if(num[i].checked==true){
            boo1=true;
            break;
          }else{
            boo1=false;
          }
        }
      }
      public(boo1,boo2);
    }
    function public(boo1,boo2){
      if(boo1||boo2){
        $rootScope.isDisabled=true;
      }else{
        $rootScope.isDisabled=false;
      }
    }
    //清除过滤条件的操作
    $scope.clearFilter=function(){
      localStorageTools.remove("state");
      localStorageTools.remove("num");
      for(var i in $rootScope.capacityList){
        $rootScope.capacityList[i].checked=false;
      }
      for(var i in $rootScope.equipmentInfo){
        $rootScope.equipmentInfo[i].checked=false;
      }
      $rootScope.isDisabled=false;
    }
    //点击SAVE后筛选操作
    $scope.saveFilterInfo = function () {

      $rootScope.filter.equipment = $rootScope.equipmentInfo;
      $rootScope.filter.capacity = $rootScope.capacityList;
      $rootScope.state=$rootScope.filter.equipment;
      localStorageTools.set("state",JSON.stringify($rootScope.state));
      localStorageTools.set("num",JSON.stringify($rootScope.filter.capacity));
      $ionicSideMenuDelegate.toggleRight();
      $rootScope.filter.isFiltering = true;//标志位 标志是进行筛选
      localStorageTools.set('selectedId',JSON.stringify($rootScope.filter.location));
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
          'Content-Type': 'application/json',
          'Abp.TenantId': localStorageTools.get('tenantId')
        },
        "url": localStorageTools.get('serverInfo') + "/api/services/app/resource/GetSpaceEventsList",
        "data": {
          "starts": $rootScope.paramsInfo.start_time,
          "ends": $rootScope.paramsInfo.end_time,
          "locationId":$rootScope.filter.location.id
        }
      }).then(function success(res){
          tipService.loadingHide();
          if (res.data.success === 'true' || res.data.success === true) {
            $rootScope.building=$rootScope.filter.location.building;
            var roomsEvent=res.data.result.items;
            $rootScope.roomList=[];
            for(var i in roomsEvent){
              $rootScope.roomList.push(roomsEvent[i].space);
            }
            if(localStorageTools.get("num")==null){
              for(var i in $rootScope.filter.capacity){
                if($rootScope.filter.capacity[i].checked==true){
                  $rootScope.capacityList[i].checked=true;
                  $rootScope.filter.isFiltering=true;
                }
              }
            }else{
              $rootScope.filter.capacity=JSON.parse(localStorageTools.get("num"));
              $rootScope.capacityList=JSON.parse(localStorageTools.get("num"));
              $rootScope.filter.isFiltering=true;
            }
            if(localStorageTools.get("state")==null){
              for(var i in $rootScope.filter.equipment){
                if($rootScope.filter.equipment[i].checked==true){
                  $rootScope.filter.isFiltering=true;
                }
              }
            }else{
              $rootScope.filter.equipment=JSON.parse(localStorageTools.get("state"));
              //$rootScope.filter.isFiltering=true;
            }
            if($rootScope.equipmentInfo==null){
              if($rootScope.state){
                $rootScope.equipmentInfo=$rootScope.state;
              }else{
                $rootScope.equipmentInfo=JSON.parse(localStorageTools.get("state"));
              }
            }
            var filteredRooms = roomService.filteringRoom($rootScope.roomList, $rootScope.filter);
            //会议室信息列表分组
            $timeout(function () {
              $rootScope.floorList = roomService.groupingRooms(filteredRooms.sort(function(a,b){
                return parseInt(a.floor)-parseInt(b.floor);
              }));//房间根据楼层进行分组
            }, 200);
          }
        },function error(res){
          tipService.loadingHide();
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
  });
