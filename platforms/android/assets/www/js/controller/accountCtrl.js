/**
 * Created by zhangbaoxiang on 16/3/23.
 */
angular.module('myApp')

  /* account controller */
  .controller('accountCtrl', function ($scope,$rootScope, $state,localStorageTools) {

    $scope.logout = function () {
      localStorageTools.remove('justmeetingToken');
      $rootScope.userInfo = null;
      $state.go('login');
    };

  })
