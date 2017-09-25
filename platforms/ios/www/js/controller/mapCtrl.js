/**
 * Created by zhangbaoxiang on 16/4/13.
 */
angular.module('myApp')
  .controller('mapCtrl', function ($rootScope,$scope, $timeout,$interval,$ionicScrollDelegate,menuContent,mapInfo) {

    console.log('mmmmmmm');
    $scope.$on('$ionicView.beforeEnter',function(){
      $scope.mapInfo = mapInfo['topView'];
      $ionicScrollDelegate.$getByHandle('map').scrollTo(600,0);
      $ionicScrollDelegate.$getByHandle('map').zoomTo(0.6);
      $scope.menuContent = menuContent;

      $scope.nowMenu = $scope.menuContent.mainMenu;

      $scope.path = {
        'V102':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725"
        },
        'V103':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2130 875  L1800 600"
        },
        'H201':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L700 725 L400 800 L280 840 L220 740 L180 640 L400 540 L400 480"
        },
        'H202':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L700 725 L400 800 L280 840 L220 740 L180 640 L400 540 L400 420"
        },
        'H203':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L700 725 L400 800 L280 840 L220 740 L180 640 L400 540 L400 170 L100 170 "
        },
        'H204':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L700 725 L400 800 L300 950"
        },
        'H205':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L700 725 L400 800 L280 840"
        },
        'H206':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L700 725 L400 800 L280 840 L220 740"
        },
        'H207':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M1500 725 L1600 725 L1630 700"
        },
        'H303':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L575 900"
        },
        'H304':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L2375 900"
        },
        'H302':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L600 800 L600 500 L580 500"
        },
        'H301':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L600 800 L600 200 L450 200 L450 175 L150 175"
        },
        'H401':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L600 800 L600 200 L450 200 L450 175 L150 175"
        },
        'H402':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L600 800 L600 400 L580 350"
        },
        'H403':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L600 800 L600 500 L580 500"
        },
        'H404':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L1500 900 L1450 850 L1175 850 L1125 925 L800 925 L575 900"
        },
        'H405':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2125 900 L2350 900 "
        },
        'H501':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2350 950 L1920 950 L1880 500 L1700 500 L1700 450"
        },
        'H502':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M2350 950 L1920 950 L1880 680 L580 680 L500 750"
        },
        'P301':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M900 950 L920 500 L760 500 L760 320 L1175 320"
        },
        'P302':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M900 950 L920 500 L760 500 L760 320 L1250 320"
        },
        'P303':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M900 950 L920 500 L1000 500"
        },
        'P304':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M900 950 L920 500 L1250 500"
        },
        'P306':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M900 950 L920 500 L760 500 L760 320 L900 320"
        },
        'P307':{
          show:false,
          strokeDashArray: 3000,
          strokeDashoffset : 3000,
          d:"M900 950 L920 500 L850 500"
        },
      };

      $scope.road = {
        show : false
      };

      $scope.roomIcon = {
        show : false,
        left : "70"+"px",
        top : "120"+"px",
        url: "img/map/room/H203_Green.png"
      }

      $scope.iconInfo = {
        'V102': {
          left:"2200px",
          top:"700px",
          url: "img/map/room/V102",
          state:"_Green.png"
        },
        'V103': {
          left:"1750px",
          top:"530px",
          url: "img/map/room/V103",
          state:"_Green.png"
        },
        'H201': {
          left:"270px",
          top:"410px",
          url: "img/map/room/H201",
          state:"_Green.png"
        },
        'H202': {
          left:"270px",
          top:"350px",
          url: "img/map/room/H202",
          state:"_Green.png"
        },
        'H203': {
          left:"30px",
          top:"140px",
          url: "img/map/room/H203",
          state:"_Green.png"
        },
        'H204': {
          left:"200px",
          top:"890px",
          url: "img/map/room/H204",
          state:"_Green.png"
        },
        'H205': {
          left:"100px",
          top:"800px",
          url: "img/map/room/H205",
          state:"_Green.png"
        },
        'H206': {
          left:"70px",
          top:"700px",
          url: "img/map/room/H206",
          state:"_Green.png"
        },
        'H207': {
          left:"1540px",
          top:"500px",
          url: "img/map/room/H207",
          state:"_Green.png"
        },
        'H301': {
          left:"40px",
          top:"90px",
          url: "img/map/room/H301",
          state:"_Green.png"
        },
        'H302': {
          left:"440px",
          top:"420px",
          url: "img/map/room/H302",
          state:"_Green.png"
        },
        'H303': {
          left:"440px",
          top:"800px",
          url: "img/map/room/H303",
          state:"_Green.png"
        },
        'H304': {
          left:"2360px",
          top:"800px",
          url: "img/map/room/H304",
          state:"_Green.png"
        },
        'H401': {
        left:"40px",
          top:"90px",
          url: "img/map/room/H401",
          state:"_Green.png"
        },
        'H402': {
          left:"480px",
            top:"260px",
            url: "img/map/room/H402",
            state:"_Green.png"
        },
        'H403': {
          left:"480px",
            top:"420px",
            url: "img/map/room/H403",
            state:"_Green.png"
        },
        'H404': {
          left:"480px",
          top:"800px",
          url: "img/map/room/H404",
          state:"_Green.png"
        },
        'H405': {
          left:"2360px",
            top:"800px",
            url: "img/map/room/H405",
            state:"_Green.png"
        },
        'H501': {
          left:"1650px",
          top:"350px",
          url: "img/map/room/H501",
          state:"_Green.png"
        },
        'H502': {
          left:"450px",
          top:"650px",
          url: "img/map/room/H502",
          state:"_Green.png"
        },
        'P301': {
          left:"1100px",
          top:"280px",
          url: "img/map/room/P301",
          state:"_Green.png"
        },
        'P302': {
          left:"1200px",
          top:"280px",
          url: "img/map/room/P302",
          state:"_Green.png"
        },
        'P303': {
          left:"910px",
          top:"430px",
          url: "img/map/room/P303",
          state:"_Green.png"
        },
        'P304': {
          left:"1210px",
          top:"430px",
          url: "img/map/room/P304",
          state:"_Green.png"
        },
        'P306': {
          left:"850px",
          top:"280px",
          url: "img/map/room/P306",
          state:"_Green.png"
        },
        'P307': {
          left:"780px",
          top:"430px",
          url: "img/map/room/P307",
          state:"_Green.png"
        },
      }

      for(var i in $rootScope.roomStateList){
        if($rootScope.roomStateList[i].state == 'Available'){
          $scope.iconInfo[$rootScope.roomStateList[i].name].state = "_Green.png";
        }
        if($rootScope.roomStateList[i].state == 'Occupied'){
          $scope.iconInfo[$rootScope.roomStateList[i].name].state = "_Red.png";
        }
        if($rootScope.roomStateList[i].state == 'Waiting'){
          $scope.iconInfo[$rootScope.roomStateList[i].name].state = "_Orange.png";
        }
      }

    });

    $scope.showMenu = false;

    var timer;
    //打开或者关闭菜单
    $scope.changeMenu = function (val,buttonText) {
      if(buttonText == 'MENU'){
        $scope.showMenu = !val
        $scope.road.show = false;
        $scope.roomIcon.show = false;
        $interval.cancel(timer);
      }else{
        $scope.showMenu = false;
        $scope.nowMenu ={};
        $scope.nowMenu.buttonText = 'Menu';
        $timeout(function(){
          $scope.nowMenu = $scope.menuContent['mainMenu'];
          $timeout(function(){
            $scope.showMenu = true;
          },200);
        },500);
      }
    };
    //切换菜单
    $scope.switchMenu = function (index,menuText) {
      if ($scope.nowMenu.subMenu[index].isSubmenu == true) {
        $scope.showMenu = false;
        //记录需要展示的菜单名称
        var next = $scope.nowMenu.subMenu[index].name;
        $scope.nowMenu ={};
        $scope.nowMenu.buttonText = next;
        $timeout(function () {

          $scope.mapInfo = mapInfo[next];

          $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);
          if(menuText == 'PD3F'){

            $ionicScrollDelegate.$getByHandle('map').scrollTo(360,300);
          }else{
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
          }
          $scope.nowMenu = $scope.menuContent[next];
          $timeout(function(){
            $scope.showMenu = true;
          },200);
        }, 500);
      }else {

        $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);

        $scope.showMenu = false;
        $scope.nowMenu = $scope.menuContent['mainMenu'];
        var nowPath = document.getElementById('road');
        $scope.road.d = $scope.path[menuText].d;

        $scope.roomIcon = $scope.iconInfo[menuText];

        $timeout(function(){
          var pathLength = nowPath.getTotalLength();
          $scope.road.strokeDashArray = pathLength;
          $scope.road.strokeDashoffset = pathLength;
          $scope.road.show = true;
          $scope.roomIcon.show=true;

          if(menuText == 'H501'){
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -10 >0){
                $scope.road.strokeDashoffset -=10;
                var coordinate = $ionicScrollDelegate.$getByHandle('map').getScrollPosition();
                if($scope.road.strokeDashoffset < 600){
                  $ionicScrollDelegate.$getByHandle('map').scrollTo(coordinate.left-5,0);
                }
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);
          }else if(menuText == 'H502'){
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -9 >0){
                $scope.road.strokeDashoffset -=9;
                var coordinate = $ionicScrollDelegate.$getByHandle('map').getScrollPosition();
                $ionicScrollDelegate.$getByHandle('map').scrollTo(coordinate.left-4,0);
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);
          }else if(menuText.indexOf('P3')!= -1){
            $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);
            $ionicScrollDelegate.$getByHandle('map').scrollTo(360,300);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -9 >0){
                $scope.road.strokeDashoffset -=9;
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);//TIMER
          } else if(menuText == 'H304'){
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
            $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -9 >0){
                $scope.road.strokeDashoffset -=9;
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);//TIMER
          }else if(menuText == 'H405'){
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
            $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -9 >0){
                $scope.road.strokeDashoffset -=9;
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);//TIMER
          }else if(menuText == 'H207'){
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
            $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -9 >0){
                $scope.road.strokeDashoffset -=9;
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);//TIMER
          } else{
            $ionicScrollDelegate.$getByHandle('map').scrollTo(2000,300);
            $ionicScrollDelegate.$getByHandle('map').zoomTo(0.3);
            timer= $interval(function(){
              if($scope.road.strokeDashoffset -10 >0){
                $scope.road.strokeDashoffset -=10;
                var coordinate = $ionicScrollDelegate.$getByHandle('map').getScrollPosition();
                $ionicScrollDelegate.$getByHandle('map').scrollTo(coordinate.left-5,0);
              }
              else{
                $interval.cancel(timer);
              }
            } ,30);
          }
        },100);
      }
    };

    $scope.$on('$ionicView.beforeEnter',function(){
      $ionicScrollDelegate.$getByHandle('map').zoomTo(1);
    });


  });
