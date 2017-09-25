/**
 * Created by zhangbaoxiang on 16/3/23.
 */
angular.module('myApp')

  /* account controller */
  .controller('accountCtrl', function ($scope,$rootScope, $state,localStorageTools) {
    $scope.logout = function () {
      localStorageTools.remove('justmeetingToken');
      //将上一个账户的信息都给清除
      localStorageTools.remove('selectedId');
      localStorageTools.remove('num');
      localStorageTools.remove('state');
      for(var i in $rootScope.capacityList){
        $rootScope.capacityList[i].checked=false;
      }
      for(var i in $rootScope.equipmentInfo){
        $rootScope.equipmentInfo[i].checked=false;
      }
      //按钮被禁用
      $rootScope.isDisabled=false
      $rootScope.userInfo = null;
      $state.go('login');
    };
  })
