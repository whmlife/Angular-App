/**
 * Created by zhangbaoxiang on 16/3/11.
 */
angular.module('appService', ['ionic'])
    //提示框
    .factory('tipService', function($ionicPopup, $ionicLoading, $ionicHistory, $timeout) {
        return {
            loginError: function(msg) {
                $ionicPopup.alert({
                    title: '<h4>Error<h4>',
                    template: '<p style="text-align:center;color: #868688;padding: 5px;border: 0;font-size: 16px"><b>' + msg + '</b></p>',
                    okType: 'popupconfirm'
                });
            },
            showLoading: function() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner>'
                })
            },
            loadingHide: function() {
                $ionicLoading.hide();
            },
            showResponseSuccess: function(msg) {
                $ionicLoading.show({
                    template: '<i class="ion-checkmark-round" style="font-size: 24px;"></i><p style="margin: 0;">' + msg + '</p>'
                })
                $timeout(function() {
                    $ionicLoading.hide();
                }, 2000);
            },
            showResponseError: function(msg) {
                $ionicLoading.show({
                    template: '<i class="ion-close-round" style="font-size: 24px;"></i><p style="margin: 0;">' + msg + '</p>'
                });
                $timeout(function() {
                    $ionicLoading.hide();
                }, 2500);
            },
            showTips: function(msg) {
                $ionicLoading.show({
                    template: msg
                });
            },
            showRoomSchedule: function($scope) {
                $ionicLoading.show({
                    templateUrl: 'templates/modal/room_schedule.html',
                    scope: $scope
                });
            },
            submitSuccess: function(msg) {
                $ionicPopup.alert({
                    title: '<h4>Alert<h4>',
                    template: '<p style="text-align:center;color: #868688;padding: 5px;border: 0;font-size: 16px"><b>' + msg + '</b></p>',
                    okType: 'popupconfirm'
                }).then(function() {
                    $ionicHistory.goBack(-1);
                });
            }

        } //return
    }) // tipService
    .factory('modalService', function($ionicPopup, $timeout, $state, $stateParams, $http, $ionicHistory, $ionicLoading, localStorageTools, tipService) {
        return {
            showDeleteConfirm: function($scope) {
                $ionicPopup.show({
                    template: 'Do You Want To Delete This Meeting?',
                    title: '<h4>Delete</h4>',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' }, {
                            text: '<b>Delete</b>',
                            type: 'button-assertive',
                            onTap: function(e) {
                                $ionicLoading.show({
                                    template: '<ion-spinner icon="ios"></ion-spinner>'
                                });

                                $http({
                                    "method": "POST",
                                    "url": localStorageTools.get('serverInfo') + "/api/services/app/schedule/DeleteEvent",
                                    "headers": {
                                        'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
                                        'Content-Type': 'application/json'
                                    },
                                    "data": {
                                        "id": $scope.meetingInfo.id
                                    }
                                }).success(function(data) {
                                    if (data.success == true || data.success == 'true') {
                                        tipService.showResponseSuccess('Success');
                                        $ionicHistory.goBack(-1);
                                    }
                                }).error(function(){
                                  //tipService.showResponseError('Error');
                                  tipService.loadingHide();
                                });
                            }
                        }
                    ]
                })
            },

            showSaveConfirm: function($scope) {
                $ionicPopup.show({
                    template: 'Do You Want To Save This Meeting?',
                    title: '<h4>Save</h4>',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                          text: '<b>Save</b>',
                          type: 'button-balanced',
                          onTap: function(e) {
                              console.log($scope.evs);
                              var legalBoo=true;//是合法的
                              var unLegalEv=[];
                              for(var i in $scope.evs){
                                if(($scope.evs[i].starts.getTime()<$scope.meetingInfo.starts.getTime())&&($scope.meetingInfo.starts.getTime()<$scope.evs[i].ends.getTime())){
                                  legalBoo=false;
                                  unLegalEv=$scope.evs[i];
                                  break;
                                }
                              }
                              if(!legalBoo){
                                console.log(unLegalEv);
                                tipService.showResponseError("有会议相冲突,请重新预订会议时间");
                              }else{
                                tipService.showLoading();
                                $http({
                                  "method": "POST",
                                  "url": localStorageTools.get('serverInfo') + "/api/services/app/schedule/UpdateEvent",
                                  "headers": {
                                    'Authorization': 'Bearer ' + localStorageTools.get('justmeetingToken'),
                                    'Content-Type': 'application/json'
                                  },
                                  'data': {
                                    "id": $scope.meetingInfo.id,
                                    "starts": moment($scope.meetingInfo.starts).format(),
                                    "ends": moment($scope.meetingInfo.ends).format(),
                                    "id": $scope.meetingInfo.id,
                                    "invitees": $scope.inviteeList,
                                    "isAllDay":$scope.meetingInfo.isAllDay,
                                    "title": $scope.meetingInfo.title,
                                    "content": $scope.meetingInfo.content
                                  }
                                }).success(function(data) {
                                  if (data.success == true || data.success == 'true') {
                                    console.log(data.result);
                                    $scope.meetingInfo.content=$scope.meetingInfo.content;
                                    tipService.showResponseSuccess('Success');
                                    $ionicHistory.goBack(-1);
                                  } else {
                                    tipService.showResponseError('Error');
                                    $timeout(function() {
                                      $state.go('login');
                                    }, 1000);
                                  }
                                }).error(function(){
                                  tipService.showResponseError("fail to satisfy requirement");
                                });
                              }
                          }
                        }
                    ]
                })
            },
        }
    })

//房间分组
.factory('roomService', function() {
        return {
            groupingRooms: function(rooms) {
                var floor = {};
                var result = [];
                //根据楼层对房间分组
                for (var i = 0; i < rooms.length; i++) {
                    var room = rooms[i];
                    // console.log(room.floor);
                    // console.log(!floor[room.floor]);//检测属性是否重复，没重复推进result
                    if (!floor[room.floor]) {
                        result.push({
                            'floorID': room.floor,
                            'roomList': [room]
                        });
                        floor[room.floor] = room;
                    } else {
                        for (var j = 0; j < result.length; j++) {
                            var _floor = result[j];
                            if (_floor.floorID == room.floor) {
                                _floor.roomList.push(room); //重复的话，会将roomList数组给推出去
                                break;
                            }
                        }
                    }
                }
                console.log(result);
                return result;
            }, //groupingRooms
            //房间过滤
            filteringRoom: function(rooms, filter) {
                var result = [];
                if (filter.isFiltering === false || filter.isFiltering === 'false') {
                    return rooms;
                }else{
                  var flist = filter.capacity.filter(function(s) {
                    return s.checked == true;
                  })
                  //人数范围过滤
                  if (flist.length > 0) {
                    for (var i in flist) {
                      for (var j in rooms) {
                        if(parseInt(flist[i].text)==26){
                          if (rooms[j].capacity == 26 && rooms[j].capacity > 26) {
                            result.push(rooms[j]);
                          }
                        }else{
                          if(rooms[j].capacity>=parseInt(flist[i].text)&&rooms[j].capacity<=(flist[i].text).replace(/.*\-/, '')){
                            result.push(rooms[j]);
                          }
                        }
                      }
                    }
                  } else {
                    result=rooms;
                  }
                  var _result = [];
                  for (var i = 0; i < result.length; i++) {
                    var roomEquipment = {};
                    var flag = true;
                    for (var j = 0; j < result[i].equipmentList.length; j++) {
                      roomEquipment[result[i].equipmentList[j].name] = true;
                    }
                    for (var k = 0; k < filter.equipment.length; k++) {

                      if (filter.equipment[k].checked == true) {
                        if (!roomEquipment[filter.equipment[k].name] || roomEquipment[filter.equipment[k].name] == undefined) {
                          flag = false;
                          break;
                        }
                      }
                    }
                    if (flag == true) {
                      _result.push(result[i]);
                    }
                  }
                  return _result;
                }







            }
        } //return
    })
    //左侧快速导航
    .service('anchorSmoothScroll', function($ionicScrollDelegate) {
        this.scrollTo = function(eID, dis) {
            var stopY = elmYPosition(eID);
            $ionicScrollDelegate.scrollTo(0, stopY - dis, true);
        };

        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            if (elm) {
                var y = elm.offsetTop;
                var node = elm;
                while (node.offsetParent && node.offsetParent != document.body) {
                    node = node.offsetParent;
                    y += node.offsetTop;
                }
                return y;
            } else {
                return 0;
            }
        }

    })

.factory('scheduleTools', function(localStorageTools) {

        function getDateValue(date) {
            var val = moment(date).unix() * 1000; //Date.parse(moment(date));
            return val;
        }

        //插入排序
        function _insertSort(array) {
            var i = 1,
                j, step, key, len = array.length;
            for (; i < len; i++) {
                step = j = i;
                key = array[j];

                while (--j > -1) {
                    if (new Date(moment(array[j].starts.replace('T', ' '))) > new Date(moment(key.starts.replace('T', ' ')))) {
                        array[j + 1] = array[j];
                    } else {
                        break;
                    }
                }
                array[j + 1] = key;
            }
            return array;
        }

        //时间判断
        function judegTimeAvailable(evs, newEvent) {
            //标记
            var flag = true;
            if ((getDateValue(newEvent.starts) < moment().unix() * 1000 && getDateValue(newEvent.ends) > moment().unix() * 1000)||getDateValue(newEvent.starts) > moment().unix() * 1000) {
                for (var i = 0; i < evs.length; i++) {
                    //跳过和自身对比
                    if (newEvent.id === evs[i].id) {
                        continue;
                    }
                    //判断不可用
                    if (getDateValue(newEvent.starts) < getDateValue(evs[i].ends) && getDateValue(newEvent.ends) > getDateValue(evs[i].starts)) {
                        flag = false;
                        return flag;
                    } else {
                        flag = true;
                    }
                }
            } else {
                for (var i = 0; i < evs.length; i++) {
                    if (newEvent.id === evs[i].id) {
                        flag = false;
                        break;
                    }
                }
            }
            return flag;
        }

        return {

            //处理所有会议事件
            dealEvent: function(evs) {
                evs = _insertSort(evs);
                var stack = [];
                var ev, i, j, k, _is_sorder, _max_sorder, _sorder_set;
                for (i = 0; i < evs.length; i++) {
                    ev = evs[i];
                    ev.starts = new Date(moment(ev.starts));
                    ev.ends = new Date(moment(ev.ends));
                    ev.$inner = false;
                    while (stack.length && getDateValue(stack[stack.length - 1].ends) <= getDateValue(ev.starts)) {
                        stack.splice(stack.length - 1, 1);
                    }
                    _sorder_set = false;
                    for (j = 0; j < stack.length; j++) {
                        if (getDateValue(stack[j].ends) <= getDateValue(ev.starts)) {
                            console.log('test:' + getDateValue(stack[stack.length - 1].ends));
                            _sorder_set = true;
                            ev.$sorder = stack[j].$sorder;
                            stack.splice(j, 1);
                            ev.$inner = true;
                            break;
                        }
                    }
                    if (stack.length) stack[stack.length - 1].$inner = true;
                    if (!_sorder_set) {
                        if (stack.length) {
                            if (stack.length <= stack[stack.length - 1].$sorder) {
                                if (!stack[stack.length - 1].$sorder)
                                    ev.$sorder = 0;
                                else
                                    for (j = 0; j < stack.length; j++) {
                                        _is_sorder = false;
                                        for (k = 0; k < stack.length; k++) {
                                            if (stack[k].$sorder == j) {
                                                _is_sorder = true;
                                                break;
                                            }
                                        }
                                        if (!_is_sorder) {
                                            ev.$sorder = j;
                                            break;
                                        }
                                    }
                                ev.$inner = true;
                            } else {
                                _max_sorder = stack[0].$sorder;
                                for (j = 1; j < stack.length; j++)
                                    if (stack[j].$sorder > _max_sorder)
                                        _max_sorder = stack[j].$sorder;
                                ev.$sorder = _max_sorder + 1;
                                ev.$inner = false;
                            }
                        } else
                            ev.$sorder = 0;
                    }
                    stack.push(ev);
                    if (stack.length > (stack.max_count || 0)) stack.max_count = stack.length;
                }
                console.log(evs);
                for (var i = 0; i < evs.length; i++) {
                    evs[i].$count = stack.max_count;
                    evs[i].$evs = evs;
                }
                return evs;
            }, //dealEvent
            judgeTime: function(evs, newEvent) {
                var flag = true;
                if (getDateValue(newEvent.starts) < moment().unix() * 1000) {
                    for (var i = 0; i < evs.length; i++) {
                        //跳过和自身对比
                        if (newEvent.id === evs[i].id) {
                            continue;
                        }
                        //判断不可用
                        if (getDateValue(newEvent.starts) < getDateValue(evs[i].ends) &&  getDateValue(newEvent.ends) > getDateValue(evs[i].starts)) {
                            flag = false;
                            return flag;
                        } else {
                            flag = true;
                        }
                    }
                } else {
                    alert("不能预定超过这个时间标记的事件");
                    for (var i = 0; i < evs.length; i++) {
                        if (newEvent.id === evs[i].id) {
                            flag = false;
                            break;
                        }
                    }
                }
                return flag;
            }, //judgeTime
            setBlockPosition: function(ev) {
                var start = new Date(moment(ev.starts));
                var end = new Date(moment(ev.ends));
                content_width = document.documentElement.clientWidth * 0.9; //获取时间条宽度
                timeScaleWidth = content_width * 0.1; //时间轴宽度
                eventOffset = 2; //事件之间的间隔
                var temp_width = Math.floor((content_width - timeScaleWidth) / ev.$count);
                ev.left = ev.$sorder * (temp_width) + "px";
                if (!ev.$inner) temp_width = temp_width * (ev.$count - ev.$sorder);
                ev.width = temp_width - eventOffset + "px";

                var sm = start.getHours() * 60 + start.getMinutes();

                if (start < new Date(moment(ev.starts).hour(7).minute(0).second(0))) {
                    sm = 7 * 60;
                }

                var em = end.getHours() * 60 + end.getMinutes();

                if (end > new Date(moment(ev.starts).hour(19).minute(0).second(0))) {
                    em = 19 * 60;
                }

                ev.top = sm - 7 * 60 + "px";
                ev.height = em - sm + "px";
                ev.starts = start;
                ev.ends = end;
                //超过19点的会议不显示
                if (start.getHours() >= 19) {
                    ev.display = 'none';
                } else {
                    ev.display = 'block';
                }
                //判断当前事件是否处于编辑状态
                if (!ev.$isEdit) {
                    ev.$isEdit = false; //初始不可编辑
                }
                //判断是否当前用户是否是创建者
                if (ev.creator.emailAddress === localStorageTools.get('currentUserEmail')) {
                    ev.$create = true; //当前用户是否是创建者
                } else {
                    ev.$create = false;
                }
                //判断事件已经结束
                if (ev.ends < new Date()) {
                    ev.$isPassed = true;
                } else {
                    ev.$isPassed = false;
                }
                //判断事件是否可用
                ev.$isAvailable = judegTimeAvailable(ev.$evs, ev);
                return ev;
            }, //setBlockPosition

            changeEventTimeInfo: function(top, height, ev) {
                ev.starts = new Date(moment(ev.starts).hour(7).minute(0).second(0).add(top, 'm'));
                ev.ends = new Date(moment(ev.starts).add(height, 'm'));
                // console.log(ev.starts,ev.ends);
                return ev;
            } //changeTimeInfo

        }
    }) //scheduleTools

.factory('localStorageTools', function() {
        return {
            get: function(key) {
                try {
                    return localStorage.getItem(key);
                } catch (e) {
                    alert("localStorage获取失败！");
                }
            },
            set: function(key, value) {
                try {
                    return localStorage.setItem(key, value);
                } catch (e) {
                    alert("localStorage存入失败！");
                }
            },
            remove: function(key) {
                try {
                    return localStorage.removeItem(key);
                } catch (e) {
                    alert("localStorage删除失败！");
                }
            },
            removeAll: function() {
                try {
                    return localStorage.clear();
                } catch (e) {
                    alert("localStorage清空失败！");
                }
            },
            setObj: function(key, value) {
                try {
                    return localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    alert("localStorage存入失败！");
                }
            },
            getObj: function(key) {
                try {
                    return JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    alert("localStorage获取失败！");
                }
            }
        }
    }) //localstorageTools

.factory('timeService', function() {
    return {
        getFullTime: function(time, hour) {
            return moment(time).hour(19).minute(0).second(0);
        }
    }
})

.value('timelineData', [
        //{"timeLabel": "00:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "00:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "01:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "01:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "02:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "02:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "03:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "03:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "04:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "04:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "05:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "05:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "06:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "06:30", "isEnd": false, "isFree": true, "isSelected": false},
        { "timeLabel": "07:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "07:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "08:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "08:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "09:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "09:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "10:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "10:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "11:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "11:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "12:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "12:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "13:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "13:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "14:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "14:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "15:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "15:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "16:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "16:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "17:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "17:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "18:00", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "18:30", "isEnd": false, "isFree": true, "isSelected": false },
        { "timeLabel": "19:00", "isEnd": false, "isFree": true, "isSelected": false },
        //{"timeLabel": "19:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "20:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "20:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "21:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "21:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "22:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "22:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "23:00", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "23:30", "isEnd": false, "isFree": true, "isSelected": false},
        //{"timeLabel": "00:00", "isEnd": false, "isFree": true, "isSelected": false},
    ]);
