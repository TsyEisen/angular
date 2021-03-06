(function (angular) {
    var app = angular.module('illnessApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.router']);
    app.config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state("sidebar.addillness", {
                url: "/addillness",
                templateUrl: "partialview/addillness.html"
            })
            .state("sidebar.detailillness", {
                url: "/detailillness",
                templateUrl: "partialview/detailillness.html"
            });
    });
    app.controller('illnessController', ['$scope', '$state', '$uibModal', 'doctorService',
        function ($scope, $state, $uibModal, doctorService) {
            //从localStorage得到登录者的基本信息
            var userMessage = angular.fromJson(localStorage.getItem("ueserMessage"));
            //表格中影像图片的缩略图的地址
            var file_url = "";
            doctorService.getImgHTTP().then(function (response) {
                var urls = response.message.split(";");
                file_url = urls[0];
            }, function (error) {
            });
            //user姓名
            if (userMessage) {
                $scope.logName = userMessage[0].truename;
            } else {
                $state.go("login");
            }

            //跳转至新的病例
            $scope.jumpToAddIllness = function () {
                $state.go("sidebar.addillness");
            };
            $scope.jumpToDetailIllness = function (item) {
                var cardInfo = {};
                cardInfo.data = item;
                cardInfo.gname = $scope.groupname;
                console.log("cardInfo==", cardInfo);
                doctorService.setCardDetailData(cardInfo);
                $state.go("sidebar.detailillness");
            };

            $scope.removeCard = function (cardid,groupid) {
                var info = {
                    "cardid": cardid
                };
                console.log("$scope.current!!!!!!!",$scope.current);
                console.log("groupid", groupid);
                if (!confirm("确定要删除影像吗？")) {
                    return false;
                } else {
                    var message = {};
                    if($scope.groupname=="所有分组"){
                        message.groupid = "";
                    }else{
                        message.groupid = groupid;
                    }
                    console.log("!!!!!!!!!!!!!!!!!!!!!!message",message);
                    doctorService.removeCard(info).then(function (response) {
                        console.log("response", response);
                        var result = response.result;
                        if (result == 0) {
                            alert("病程删除成功");
                            getAllListData($scope.currentPage, message);
                        } else if (result == -1) {
                            alert("病程删除失败");
                        } else {
                            alert("病程删除失败");
                        }
                    }, function () {

                    });


                }

            };

            //定义一个groupID
            var groupID = "";
            var getGroup = function () {
                var info = {
                    "userid": userMessage[0].userid
                };
                doctorService.getCardGroup(info).then(function (response) {
                    var groupMessage = JSON.parse(response.message);
                    console.log("groupMessage", groupMessage);
                    doctorService.setCardDetailGroup(groupMessage);
                    $scope.group = groupMessage;
                    ////初始换选择第一组
                    if (groupMessage.length > 0 && $scope.group.gname !== "") {
                        $scope.groupname = $scope.group[0].gname;
                        groupID = $scope.group[0].groupid;
                    }

                    getAllListData(1);
                }, function (error) {

                });
            };
            getGroup();
            //点击病例分组
            $scope.current = 0;
            $scope.changeList = function (index) {
                $scope.current = index;
                $scope.cardTerm = "";
                groupID = $scope.group[index].groupid;
                var groupname = $scope.group[index].gname;
                $scope.groupname = groupname;
                console.log("$scope.current", $scope.current);
                getAllListData(1);
            };
            //删除病例分组
            $scope.removeGroup = function (groupid) {
                if (!confirm("确定要删除分组吗？")) {
                    return false;
                }
                var info = {
                    "groupid": groupid,
                    "doctorid": userMessage[0].userid
                };
                doctorService.removeCardGroup(info).then(function (response) {
                    var result = response.result;
                    if (result == 0) {
                        alert("删除分组成功");
                        getGroup();
                    } else if (result == -1) {
                        alert("删除分组失败");
                    } else {
                        alert("未知错误");
                    }
                }, function (error) {
                    alert("服务器异常");
                })

            };
            $scope.pageList = [
                {id: 1, pagesize: "20"},
                {id: 2, pagesize: "50"},
                {id: 3, pagesize: "100"},
                {id: 4, pagesize: "150"}
            ];
            $scope.selectValue = $scope.pageList[0];
            $scope.itemsPerPage = $scope.selectValue.pagesize;
            //选择每页显示多少条数据
            $scope.maxSize = 5;//最大显示几条页码
            $scope.getPagesize = function () {
                $scope.currentPage = 1;
                getAllListData($scope.currentPage);
            };
            //点击页码事件
            $scope.setNumPage = function () {
                getAllListData($scope.currentPage);
                $scope.jumpTo = '';
            };
            //输入页面点击确认事件
            $scope.setInputPage = function () {
                if (!isNaN($scope.jumpTo)) {
                    //输入页码不能大与最大页码
                    if (parseInt($scope.jumpTo) > $scope.numPages) {
                        $scope.jumpTo = $scope.numPages
                    }
                    $scope.currentPage = $scope.jumpTo;
                    getAllListData($scope.currentPage);
                } else {
                    alert("请输入正确页码")
                }

            };
            //回车事件
            $scope.pageKeyup = function (e) {
                var keycode = window.event ? e.keyCode : e.which;//获取按键编码
                if (keycode == 13) {
                    $scope.setInputPage();//如果等于回车键编码执行方法
                }
            };
            //搜索框搜索
            $scope.cardTermData = function () {
                getAllListData(1);
            };
            //获取病例列表总数
            var getCardCount = function (info) {
                doctorService.getCardCount(info).then(function (response) {
                    var result = response.result;
                    if (result == 0) {
                        var message = JSON.parse(response.message);
                        if (message) {
                            $scope.totalItems = message;
                        } else {
                            $scope.totalItems = 0
                        }
                    } else if (result == -1) {
                        alert("获取分组数据失败");
                    } else {
                        alert("未知错误");
                    }
                }, function (error) {

                });
            };
            //获取病例列表数据
            var getCardData = function (info) {
                doctorService.getCardData(info).then(function (response) {
                    var result = response.result;
                    console.log(JSON.parse(response.message));
                    if (result == 0) {
                        var message = JSON.parse(response.message);
                        console.log("message", message);
                        if (message) {
                            for (var i = 0; i < message.length; i++) {
                                //gender=1为男，否则为女
                                if (message[i].gender == 1) {
                                    message[i].gender = "男"
                                } else {
                                    message[i].gender = "女"
                                }
                                //患者头像
                                if (message[i].headpic) {
                                    message[i].headpic = file_url + 'public/card/' + message[i].cardid + '/'
                                        + message[i].headpic;
                                } else {
                                    message[i].headpic = '/IDoctorEnd/image/errorPatientHeaderPic.png';
                                }
                            }
                            $scope.groupTable = message;
                        }
                    } else if (result == -1) {
                        alert("获取分组数据失败");
                    } else {
                        alert("未知错误");
                    }
                }, function (error) {

                });
            };


            var getAllListData = function (curpage, message) {
                //初始化当前页为第一页
                if (curpage == undefined) {
                    curpage = 1;
                    $scope.currentPage = 1;
                }
                var info = {
                    "userid": userMessage[0].userid,
                    "groupid": groupID,
                    "curpage": curpage,
                    "pagesize": $scope.selectValue.pagesize
                };
                //搜索框搜索，不传groupid
                if ($scope.cardTerm) {
                    info.term = $scope.cardTerm;
                    info.groupid = "";
                    $scope.groupname = "所有分组";
                    $scope.current = 999999999999999;
                }
                if (message) {
                    if($scope.groupname == "所有分组"){
                        info.groupid = "";
                        $scope.current = 999999999999999;
                    }
                    if (message.patientname) {
                        info.patientname = message.patientname;
                    }
                    if (message.groupid) {
                        info.groupid = message.groupid;
                    }
                    if (message.gender) {
                        info.gender = message.gender;
                    }
                    if (message.age) {
                        info.age = message.age;
                    }
                    if (message.tel) {
                        info.tel = message.tel;
                    }
                    if (message.visittime) {
                        info.visittime = doctorService.dataFormat(message.visittime);
                    }
                }
                console.log("getAllListDataINFO", info);
                getCardData(info);
                getCardCount(info);

            };


            //新建病例分组模态框模块
            $scope.newBuildGroup = function () {
                var newGroupModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'newBuildGruopModal.html',
                    controller: 'newCardGroupModalInstanceCtrl',
                    backdrop: "static",
                    resolve: {
                        userid: function () {
                            return userMessage[0].userid
                        }
                    }
                });
                newGroupModalInstance.result.then(function (result) {//这是一个接收模态框返回值的函数
                    getGroup();
                }, function () {

                });
            };
            //新建病例分组模态框模块

            //编辑病例分组模态框模块
            $scope.editGroup = function (groupid, gname) {
                var editGroupModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'editCardGruopModal.html',
                    controller: 'editCardGroupModalInstanceCtrl',
                    backdrop: "static",
                    resolve: {
                        groupInfo: function () {
                            var info = {
                                "groupid": groupid,
                                "gname": gname
                            };
                            return info
                        }
                    }
                });
                editGroupModalInstance.result.then(function (result) {
                    getGroup();
                }, function () {

                });
            };
            //编辑病例分组模态框模块

            $scope.highSearch = function () {
                var ModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'doctorCardHighSearchModal.html',
                    controller: 'doctorCardHighSearchInstanceCtrl',
                    backdrop: "static"
                });
                ModalInstance.result.then(function (message) {
                    getAllListData($scope.currentPage, message);
                    $scope.groupname = "所有分组";
                }, function () {

                });
            }

        }]);

    //$uibModalInstance是新建分组模态窗口的实例
    app.controller('newCardGroupModalInstanceCtrl', ['$scope', '$uibModalInstance', 'userid', 'doctorService',
        function ($scope, $uibModalInstance, userid, doctorService) {
            $scope.ensure = function () {
                if ($scope.groupName) {
                    var info = {
                        "gname": $scope.groupName,
                        "doctorid": userid
                    };
                    doctorService.addCardGroup(info).then(function (response) {
                        var result = response.result;
                        if (result == 0) {
                            alert("添加分组成功");
                            $uibModalInstance.close(result);
                        } else if (result == 1) {
                            alert("分组名已存在")
                        } else if (result == -1) {
                            alert("添加分组失败");
                        }
                    }, function (error) {

                    });
                } else {
                    alert("请输入分组名称！")
                }
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }]);
    //$uibModalInstance是编辑分组模态窗口的实例
    app.controller('editCardGroupModalInstanceCtrl', ['$scope', '$uibModalInstance', 'groupInfo', 'doctorService',
        function ($scope, $uibModalInstance, groupInfo, doctorService) {
            $scope.groupName = groupInfo.gname;
            $scope.ensure = function () {
                if ($scope.groupName) {
                    var info = {
                        "gname": $scope.groupName,
                        "groupid": groupInfo.groupid
                    };
                    doctorService.editCardGroup(info).then(function (response) {
                        var result = response.result;
                        if (result == 0) {
                            alert("编辑分组成功");
                            $uibModalInstance.close(result);
                        } else if (result == -1) {
                            alert("编辑分组失败");
                        } else {
                            alert("编辑分组失败");
                        }
                    }, function () {

                    });
                } else {
                    alert("请输入分组名称")
                }
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }]);
    //高级搜索弹出框实例
    app.controller('doctorCardHighSearchInstanceCtrl', ['$scope', '$uibModalInstance', 'doctorService',
        function ($scope, $uibModalInstance, doctorService) {
            var message = {};
            $scope.highOpen = function () {
                $scope.highOpened = true;
            };
            $scope.highOptions = {
                startingDay: 1,
                showWeeks: false,
                maxDate: new Date()
            };
            $scope.ensure = function () {
                $uibModalInstance.close($scope.high);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }]);

})(angular);