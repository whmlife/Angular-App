/**
 * Created by zhangbaoxiang on 16/3/10.
 */
angular.module('myDirective', [])
  //提示
  .directive('mytoolTips', function () {

    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {

        element[0].addEventListener('hold', showMyTips, false);
        element[0].addEventListener('release', removeMyTips, false);

        function showMyTips() {

          if (scope.room.equipments.length < 1) {
            return;
          }

          var tipsHTML;

          if (scope.room.equipments.length < 3) {
            tipsHTML = '<div class="tips" style="padding: 5px;">'
          } else {
            tipsHTML = '<div class="tips" style="padding: 5px;left:0;">'
          }

          var ipHTML = '';
          for (var i in scope.room.equipments) {
            //angular.element(this).append('<p>'+ scope.room.equipments[i].typeName+'</p>');
            if (scope.room.equipments[i].typeName === 'Phone') {
              tipsHTML += '&nbsp;&nbsp;<i class="ion-ios-telephone" style="font-size: 16px;"></i>'
            }
            if (scope.room.equipments[i].typeName === 'Projector') {
              tipsHTML += '&nbsp;&nbsp;<i class="ion-videocamera" style="font-size: 16px;"></i>'
            }
            if (scope.room.equipments[i].typeName === 'Screen') {
              tipsHTML += '&nbsp;&nbsp;<i class="ion-laptop" style="font-size: 16px;"></i>'
              ipHTML += '<span>IP:' + scope.room.equipments[i].description + '</span>'
            }
          }
          angular.element(this).append(tipsHTML + ipHTML + '</div>');
        }

        function removeMyTips() {
          var tips = angular.element(this).find('.tips');
          tips.remove();
        }
      }
    }

  })
  //时间线
  .directive('currentLine', function ($rootScope) {
    return {
      restrict: 'EA',
      replace: true,
      //scope:true,
      template: '<div class="currentline" id="currentline">' +
      '<div class="round1"></div>' +
      '</div>',
      link: function (scope, element, attrs) {
        var minutes = moment()._d.getHours() * 60 + moment()._d.getMinutes() - 7 * 60;
        element[0].style.top += minutes + 'px';

        if(element[0].offsetTop > 720 ){
          element[0].style.display = 'none';
        }
        console.log(minutes);
        console.log("时间线");
        console.log($rootScope.current);
        //if($rootScope.meetingInfo!=undefined){
        //  console.log($rootScope.meetingInfo.starts.format());
        //}
        console.log(moment().format("YYYY MM DD"));
        if($rootScope.current != moment().format("YYYY MM DD")){
          element[0].style.visibility = 'hidden';
        }else{
          element[0].style.visibility = 'visible'
        }

      }
    }
  })// currentline

  //会议块
  .directive('eventBlock', function (localStorageTools, scheduleTools, $state, $stateParams,$rootScope) {

    function resetBlock(element, ev) {
      var top = element.offsetTop;
      var height = element.offsetHeight;

      ev.starts = new Date(moment(ev.starts).hour(7).minute(0).second(0).add(top, 'm'));
      ev.ends = new Date(moment(ev.starts).add(height, 'm'));
      ev.top = top + 'px';
      ev.height = height + 'px';
    }

    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        //新事件块直接绑定移动事件,修改的块绑定长按事件
        if (scope.ev.$create) {
          if (scope.ev.$isNew || scope.ev.$isEdit) {
            bindEventToBlock();
            /*绑定事件*/
          } else {
            element[0].addEventListener('hold', changeEventBlock_state, false);
          }
        }
        var startY, preY, preHeight, startTop, maxHeight, tapflag = 0, tapTimer;

        function bindEventToBlock() {
          var a = element.append('<p class="dragline"><i class="ion-ios-drag" style="position: absolute;top: -5px;"></i></p>');
          element[0].addEventListener('touchstart', moveEventBlock_start, false);
          element[0].addEventListener('touchmove', moveEventBlock_move, false);
          element[0].addEventListener('touchend', moveEventBlock_end, false);
          var dragline = element[0].children[1];
          dragline.addEventListener('touchstart', changeEventBlock_start, false);
          dragline.addEventListener('touchmove', changeEventBlock_move, false);
          dragline.addEventListener('touchend', changeEventBlock_end, false);
        }

        function changeEventBlock_state() {
          console.log(scope.ev.$evs);
          for (var i in scope.ev.$evs) {
            tapflag = 1000;
            if (scope.ev.$evs[i].$isEdit && !scope.ev.$evs[i].$isNew) {
              return;
            }
            //删除新事件块
            if (scope.ev.$evs[i].$isEdit && scope.ev.$evs[i].$isNew) {
              scope.ev.$evs.splice(i, 1);
            }
          }
          scope.ev.$isEdit = true;
          scope.ev = scheduleTools.setBlockPosition(scope.ev);
          scope.$apply();
          if(scope.ev.$isAvailable){
            bindEventToBlock();
          }
        }
        //************************************移动的三个事件touchstart,tuochmove,touchend********************************************************
        function moveEventBlock_start(event) {
          try {
            event.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
            event.stopPropagation();//阻止事件冒泡
            var touch = event.touches[0]; //获取第一个触点
            var y = Math.ceil(touch.pageY); //页面触点Y坐标
            tapflag = 0;

            tapTimer = setInterval(function(){
              tapflag +=100;
            },100);
            //记录触点初始位置
            startY = y;
            startTop = element[0].offsetTop;
            preY = y;
          } catch (e) {
            alert('touchSatrtFunc：' + e.message);
          }
        }

        function moveEventBlock_move(event) {
          try {
            event.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
            event.stopPropagation();//阻止事件冒泡
            var touch = event.touches[0]; //获取第一个触点
            var y = Math.ceil(touch.pageY); //页面触点Y坐标
            //tapflag ++; //是这标志位 区分点击和拖动
            //var scroll = angular.element('.schedulescroll')[0];
            //拖动距离临界条件处理
            var maxDistance = 60 * 12 - element[0].offsetTop - element[0].offsetHeight;
            var distance = y - preY;
            if (distance > maxDistance) {
              distance = maxDistance;
            }
            //下边界
            if (element[0].offsetTop + element[0].offsetHeight > 720) {
              element[0].style.top = 720 - element[0].offsetHeight + 'px';
            } else {
              element[0].style.top = element[0].offsetTop + distance + 'px';
            }
            //上边界
            if (element[0].offsetTop < 0) {
              element[0].style.top = 0 + 'px';
            }
            //更新y
            preY = y;
            /*修改事件块时间*/
            scope.ev = scheduleTools.changeEventTimeInfo(element[0].offsetTop, element[0].offsetHeight, scope.ev);
            scope.ev = scheduleTools.setBlockPosition(scope.ev);
            scope.$apply();
            /*修改事件块时间*/
          } catch (e) {
            alert('touchMoveFunc：' + e.message);
          }
        }

        function moveEventBlock_end(event) {
          try {
            console.log('moveEventBlock_end run');
            event.preventDefault();
            event.stopPropagation();
            var endTop = element[0].offsetTop;
            var floatDis = endTop % 15;
            if ((endTop) % 15 !== 0) {
              element[0].style.top = endTop - floatDis + 'px';
            }
            /*修改事件块时间*/
            scope.ev = scheduleTools.changeEventTimeInfo(element[0].offsetTop, element[0].offsetHeight, scope.ev);
            scope.ev = scheduleTools.setBlockPosition(scope.ev);
            scope.$apply();
            //页面跳转
            clearInterval(tapTimer);
            if (tapflag <= 100 && scope.ev.$isAvailable) {

              scope.ev.duration = parseInt(scope.ev.height)/60;

              if (scope.ev.$isNew) {
                $rootScope.evInfo = scope.ev;
                $state.go('app.index.newReservation', {'id': $stateParams.id});
              } else {
                $rootScope.meetingInfo = scope.ev;
                $state.go('app.index.meetingDetail', {'id': $stateParams.id});
              }
            }
            /*修改事件块时间*/
          } catch (e) {
            alert('touchendFunc; ' + e.message);
          }
        }
        //*******************************moveEventBlock的三个事件touchstart,touchmove,touchend结束了**********************************************************
        function changeEventBlock_start(event) {
          try {
            console.log('changeEventBlock_start run');
            event.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
            event.stopPropagation();//阻止事件冒泡
            var touch = event.touches[0]; //获取第一个触点
            var y = Math.ceil(touch.pageY); //页面触点Y坐标
            tapflag = 0;
            tapTimer = setInterval(function(){
              tapflag +=100;
            },100);
            startY = y;
            startTop = element[0].offsetTop;
            maxHeight = 60 * 12 - element[0].offsetTop;
            preY = y;
          } catch (e) {
            alert('changeEventBlock_start：' + e.message);
          }
        }

        function changeEventBlock_move(event) {
          try {
            console.log('changeEventBlock_move run');
            event.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
            event.stopPropagation();//阻止事件冒泡
            //tapflag ++;
            var touch = event.touches[0]; //获取第一个触点
            var y = Math.ceil(touch.pageY); //页面触点Y坐标
            var blockHeight = element[0].offsetHeight;
            var maxMinutes = maxHeight;
            var minutes = y - preY + blockHeight;
            // console.log('maxMinutes:' + maxMinutes);
            // console.log('minutes:' + blockHeight);
            if (minutes > maxHeight) {
              minutes = maxHeight;
            }
            element[0].style.height = minutes + 'px';
            preY = y;
            scope.ev = scheduleTools.changeEventTimeInfo(element[0].offsetTop, element[0].offsetHeight, scope.ev);
            scope.ev = scheduleTools.setBlockPosition(scope.ev);
            scope.$apply();
          } catch (e) {
            alert('changeEventBlock_move: ' + e.message);
          }
        }

        function changeEventBlock_end(event) {
          try {
            console.log('changeEventBlock_end run');
            event.preventDefault();
            event.stopPropagation();
            var blockHeight = element[0].offsetHeight;
            if (blockHeight % 15 !== 0) {
              element[0].style.height = blockHeight - (blockHeight % 15) + 'px';
            }
            scope.ev = scheduleTools.changeEventTimeInfo(element[0].offsetTop, element[0].offsetHeight, scope.ev);
            scope.ev = scheduleTools.setBlockPosition(scope.ev);
            scope.$apply();

            clearInterval(tapTimer);
            if (tapflag<=100 && scope.ev.$isAvailable) {
              // scope.ev.duration = parseInt(scope.ev.height)/60;
              console.log($stateParams);
              //进行跳转预定界面,如果是新的会议跳转到app.index.newReservation，否则跳转到app.index.meetingDetail
              if (scope.ev.$isNew) {
                $rootScope.evInfo = scope.ev;
                $state.go('app.index.newReservation', {'id': $stateParams.id});
              } else {
                $rootScope.meetingInfo = scope.ev;
                scope.meetingInfo.starts=scope.ev.starts;
                scope.meetingInfo.ends=scope.ev.ends;
                scope.ev.title=scope.meetingInfo.title;
                console.log("222222222222");
                console.log(scope.meetingInfo.starts,scope.meetingInfo.ends);
                $state.go('app.index.meetingDetail', {'id': $stateParams.id});
              }
            }

          } catch (e) {
            alert('changeEventBlock_end :' + e.message);
          }
        }
      }
    }
  })
;//EOF
