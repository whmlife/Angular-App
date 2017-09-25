/**
 * Created by zhangbaoxiang on 16/3/17.
 */
angular.module('myApp')
    /* 用户登录Controller */
    .controller('loginCtrl', function($scope, $state, $http, $timeout, $ionicModal,tipService, localStorageTools) {

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
            }else {
                tipService.showLoading();
                $http({
                    "method": "POST",
                    "url": $scope.loginInfo.server + "/api/Account",
                    "data": {
                        "userNameOrEmailAddress": $scope.loginInfo.userName,
                        "password": $scope.loginInfo.passWord,
                        "tenancyName":"default"
                    }
                }).success(function(data) {
                    if (data.success === true || data.success === "true") {
                        //将一些东西放到本地存储
                        localStorageTools.set('justmeetingToken', data.result);
                        localStorageTools.set('serverInfo', $scope.loginInfo.server);
                        localStorageTools.set('userName', $scope.loginInfo.userName);
                        localStorageTools.setObj('loginInfo', $scope.loginInfo);
                        tipService.loadingHide();
                        $state.go('app.index');
                    } else {
                        tipService.loadingHide();
                        tipService.loginError('Information Error!');
                    }
                 })
                .error(function(err) {
                    tipService.showResponseError("login Error");
                });
            }
        };
    });
