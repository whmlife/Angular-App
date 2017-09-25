/**
 * Created by zhangbaoxiang on 16/3/17.
 */
angular.module('myApp')
  /* 用户登录Controller */
  .controller('loginCtrl', function($rootScope,$scope, $state, $http, $timeout, $ionicModal,tipService, localStorageTools) {

    $scope.loginInfo = localStorageTools.getObj('loginInfo');
    console.log($scope.loginInfo);
    //如果本地存储没有$scope.loginInfo，则初始化server为http://
    if ($scope.loginInfo == null || $scope.loginInfo == 'undefined' || $scope.loginInfo == "") {
      $scope.loginInfo = {
        server: 'http://'
      };
    }
    //*******************************登录验证************************************
    $scope.signIn = function() {
      //验证用户名，密码，服务器
      if ($scope.loginInfo.userName == '' || typeof($scope.loginInfo.userName) != 'string') {
        tipService.loginError('UserName is null !');
        return;
      } else if ($scope.loginInfo.passWord == '' || typeof($scope.loginInfo.passWord) != 'string') {
        tipService.loginError('Password is Null !');
        return;
      } else if($scope.loginInfo.server== '' || typeof($scope.loginInfo.server) != 'string'){
        tipService.loginError('Server is Null !');
        return;
      } else {
        tipService.showLoading();
        $http({
          "method":"GET",
          "url":$scope.loginInfo.server+"/AbpScripts/GetScripts?v=new Date()"
        }).then(function success(res){
          var head= document.getElementsByTagName('head')[0];
          var script= document.createElement('script');
          script.type= 'text/javascript';
          script.innerHTML= res.data;
          head.appendChild(script);
          if(window.abp.setting.values['JustMeeting.Preferences.DefaultLocation']==""){
            window.abp.setting.values['JustMeeting.Preferences.DefaultLocation']=1;
          }
          localStorageTools.set("defaultId",window.abp.setting.values['JustMeeting.Preferences.DefaultLocation']);
          if(window.abp.multiTenancy.isEnabled){
            $http({
              "method":"POST",
              "url":$scope.loginInfo.server+"/api/services/app/account/IsUserAvailable",
              "data":{
                "emailAddress":$scope.loginInfo.userName
              }
            }).then(function success(res){
              tipService.loadingHide();
              if (res.data.success === true || res.data.success === "true") {
                console.log(res.data);
                var State = res.data.result.state;
                localStorageTools.set("tenantId",res.data.result.tenantId);
                switch (State) {
                  case 1:
                    $http({
                      "method": "POST",
                      "url": $scope.loginInfo.server + "/api/Account/Authenticate",
                      "headers": {
                        'Abp.TenantId': localStorageTools.get("tenantId")
                      },
                      "data": {
                        "userNameOrEmailAddress": $scope.loginInfo.userName,
                        "password": $scope.loginInfo.passWord
                      }
                    }).then(function success(res){
                      if (res.data.success === true || res.data.success === "true") {
                        localStorageTools.set('justmeetingToken', res.data.result);
                        localStorageTools.set('serverInfo', $scope.loginInfo.server);
                        localStorageTools.set('userName', $scope.loginInfo.userName);
                        localStorageTools.setObj('loginInfo', $scope.loginInfo);
                        tipService.loadingHide();
                        $state.go('app.index');
                      } else {
                        tipService.loginError('Information Error!');
                      }
                    },function error(res){
                      tipService.showResponseError("login Error");
                    });
                    break;
                  case 2:
                    tipService.loginError('UserName not active ! Please input active username.');
                    break;
                  default:
                    tipService.loginError('UserName is not exist ! Please input existing username.');
                }
              }
            },function error(res){
              tipService.loadingHide();
            });
          }else{
            $http({
              "method": "POST",
              "url": $scope.loginInfo.server + "/api/Account/Authenticate",
              "data": {
                "userNameOrEmailAddress": $scope.loginInfo.userName,
                "password": $scope.loginInfo.passWord
              }
            }).then(function success(res){
              tipService.loadingHide();
              if (res.data.success === true || res.data.success === "true") {
                localStorageTools.set('justmeetingToken', res.data.result);
                localStorageTools.set('serverInfo', $scope.loginInfo.server);
                localStorageTools.set('userName', $scope.loginInfo.userName);
                localStorageTools.setObj('loginInfo', $scope.loginInfo);
                $state.go('app.index');
              } else {
                tipService.loginError('Information Error!');
              }
            },function error(res){
              tipService.loadingHide();
              tipService.showResponseError("login Error");
            });
          }
        },function error(res){
        });
      }
      $timeout(function(){
        tipService.loadingHide();
      },500);
    };
  });
