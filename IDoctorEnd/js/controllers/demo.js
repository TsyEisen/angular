/**
 * Created by Eisen on 16/12/28.
 */
(function (angular) {
    var app = angular.module('expertconsultApp', ['ui.bootstrap','institutionServiceApp',"ngFileUpload"])
        .controller('expertconsultController', ['$scope', '$state', '$uibModal', 'doctorService','institutionService',
            '$filter', 'Upload','$timeout','$rootScope',function ($scope, $state, $uibModal,
                                                                  doctorService,institutionService, $filter,Upload,$timeout,$rootScope) {
                //从localStorage得到登录者的基本信息
                var userMessage = angular.fromJson(localStorage.getItem("ueserMessage"));
                var hostUrl = file_url = "";
                doctorService.getImgHTTP().then(function (response) {
                    var urls = response.message.split(";");
                    file_url = urls[0];
                }, function (error) {
                });
                //user姓名
//                $scope.logName = userMessage[0].truename;
                var images = ''; //用于记录发起专家咨询时选择影像后切换页面后记住之前的选择的影像
                var askFlag = false; // 用于发起咨询选择专家通过高级查询的判断
                // 影像分页初始化
                var imageFlag = false;
                var selectedImages = [];
                $scope.lastSelectImage = "";
                var sendImageId = "";
                $scope.consultLevels =[
                    {id:1,level:"一般"},
                    {id:2,level:"一般紧急"},
                    {id:3,level:"特殊紧急"}
                ]
                $scope.selectLevel = $scope.consultLevels[0];

                // 影像的分页
                $scope.pageList = [
                    {id: 1, pagesize: "5"},
                    {id: 2, pagesize: "10"},
                    {id: 3, pagesize: "20"},
                    {id: 4, pagesize: "50"}
                ];
                $scope.selectValue = $scope.pageList[0];
                $scope.itemsPerPage = $scope.selectValue.pagesize;//每页显示多少条数据
                $scope.currentPage=1;
                $scope.maxSize = 5;//最大显示几条页码

                // 选择每页显示几条数据
                $scope.getPagesize = function () {
                    $scope.currentPage=1;
                    initImage($scope.currentPage,$scope.selectValue.pagesize);
                    $scope.jumpImgTo = '';
                };
                //点击页码事件
                $scope.setNumPage = function () {
                    initImage($scope.currentPage,$scope.selectValue.pagesize);
                };
                //输入页面点击确认事件
                $scope.setInputPage = function () {
                    if(parseInt($scope.jumpTo)>$scope.numPages){
                        $scope.jumpTo = $scope.numPages;
                    }
                    $scope.currentPage = $scope.jumpTo;
                    initImage($scope.currentPage,$scope.selectValue.pagesize);
                };
                //回车事件
                $scope.pageKeyup = function (e) {
                    var keycode = window.event ? e.keyCode : e.which;//获取按键编码
                    if (keycode == 13) {
                        $scope.setInputPage();//如果等于回车键编码执行方法
                    }
                };
                // 选择医生分页初始化
                $scope.doctor_pageList = [
                    {id: 1, pagesize: "5"},
                    {id: 2, pagesize: "10"},
                    {id: 3, pagesize: "20"},
                    {id: 4, pagesize: "50"}
                ];
                $scope.doctor_selectValue = $scope.doctor_pageList[0];
                $scope.doctor_itemsPerPage = $scope.doctor_selectValue.pagesize;//每页显示多少条数据
                $scope.doctor_currentPage=1;
                $scope.doctor_maxSize = 5;//最大显示几条页码

                // 选择每页显示几条数据
                $scope.doctor_getPagesize = function () {
                    initExpertList($scope.doctor_currentPage,$scope.doctor_selectValue.pagesize);

                };
                //点击页码事件
                $scope.doctor_setNumPage = function () {
                    initExpertList($scope.doctor_currentPage,$scope.doctor_selectValue.pagesize,0);
                    $scope.doctor_currentPage=1;
                };
                //输入页面点击确认事件
                $scope.doctor_setInputPage = function () {
                    if(parseInt($scope.doctor_jumpTo)>$scope.doctor_numPages){
                        $scope.doctor_jumpTo = $scope.doctor_numPages;
                    }
                    $scope.doctor_currentPage = $scope.doctor_jumpTo;
                    initExpertList($scope.doctor_currentPage,$scope.doctor_selectValue.pagesize,0);
                };
                //回车事件
                $scope.doctor_pageKeyup = function (e) {
                    var keycode = window.event ? e.keyCode : e.which;//获取按键编码
                    if (keycode == 13) {
                        $scope.doctor_setInputPage();//如果等于回车键编码执行方法
                    }
                };


                // 首次加载初始化影像列表
                initImage(1,5);
                // 首次进入页面获取医生数据
                initExpertList($scope.currentPage,$scope.selectValue.pagesize,0);
                $scope.onChange = function (index) {
                    var imageId = $('input[name="imagecheck"]').eq(index).val();
                    var index = selectedImages.indexOf(imageId);
                    if (index > -1) {
                        selectedImages.splice(index, 1);
                    }else {
                        selectedImages.push(imageId);
                    }
                    $scope.lastSelectImage = imageId;
                    sendImageId = $scope.lastSelectImage;
                    institutionService.getInstMainExpImage(sendImageId).then(function (res) {
                        var imageObj = JSON.parse(res.message);
                        $scope.asktitle = imageObj.patientid+' '+ imageObj.patientname + ' '
                            + (imageObj.gender  = imageObj.sex==0?"男":"女")+' '+institutionService.getAge(imageObj.birthday)
                            +' ' + (imageObj.consultStatus = imageObj.status == 0? "专家咨询":"常规咨询")
                        $scope.patientAge = parseInt(institutionService.getAge(imageObj.birthday));
                    })

                }
                // 获取最新选择的影像信息
                $("#changeExpertBg > button").click(function(){
                    $(this).css("backgroundColor","#5ECA5D").siblings().css("backgroundColor","#E7E7E9")
                });

                $scope.clickProvince = function () {
                    $scope.citys = [];
                    var subStrProvince = $scope.selectProvince.code.slice(0,2);
                    for (var i = 0; i < $scope.allCitys.length; i++) {
                        var citycode = $scope.allCitys[i].code;
                        var subStrCity =citycode.slice(0,2);
                        if(subStrProvince==subStrCity){
                            $scope.citys.push( $scope.allCitys[i]);
                        }
                    }
                    // $scope.selectCity = $scope.citys[0];
                    $scope.selectCity = {};
                    $scope.clickCity();
                }
                $scope.clickCity = function () {
                    $scope.districts=[];
                    if( $scope.selectCity!=null){
                        var subStrCity = $scope.selectCity.code.slice(0,4);
                    }

                    for (var i = 0; i <  $scope.allDistrict.length; i++) {
                        var districtcode =  $scope.allDistrict[i].code;
                        var subStrDistrict=districtcode.slice(0,4);
                        if(subStrDistrict==subStrCity){
                            $scope.districts.push( $scope.allDistrict[i]);
                        }
                    }
                    // $scope.selectDistrict = $scope.districts[0];
                    $scope.selectDistrict = {};

                }
                $scope.clickDistrict = function () {
                }
                $scope.consultCalls = [
                    {id:"002",name:"主任医师"},
                    {id:"003",name:"副主任医师"},
                    {id:"004",name:"主治医师"},
                    {id:"005",name:"住院医师"},
                    {id:"006",name:"其它"}
                ];
                $scope.professionalPost= $scope.consultCalls[0];
                $scope.engineer = {
                    name: "Dani" ,
                    currentActivity: {
                        id: 1,
                        type: "内科" ,
                        name: "神经内科"
                    }
                };
                $scope.activities = [
                    { id: 1, type: "内科" , name: "神经内科" },
                    { id: 2, type: "内科" , name: "呼吸科" },
                    { id: 3, type: "内科" , name: "外科" },
                    { id: 4, type: "内科" , name: "骨科" },
                    { id: 5, type: "内科" , name: "神经外科"},
                    { id: 6, type: "内科" , name: "普通外科" },
                    { id: 7, type: "内科" , name: "肝胆外科" },
                    { id: 8, type: "内科" , name: "泌尿外科" },
                    { id: 9, type: "内科" , name: "胸外科" },
                    { id: 10, type: "内科" , name: "创伤骨科" },
                    { id: 11, type: "内科" , name: "功能神经外科" },

                    { id: 12, type: "其他" , name: "放射科" },
                    { id: 13, type: "其他" , name: "口腔科" },
                    { id: 14, type: "其他" , name: "超声医学科" },
                    { id: 15, type: "其他" , name: "介入放射科"},
                    { id: 16, type: "其他" , name: "放疗科" },
                    { id: 17, type: "其他" , name: "病理科" }
                ];

                $scope.chooseImg = function () {
                    imageFlag = false;
                    initImage($scope.currentPage,$scope.selectValue.pagesize);
                }
                // 高级搜索
                $scope.experthighsearch = function (size) {
                    // initImage(1, 5);
                    // imageFlag = true;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'docExpAsk_ImageModal.html',
                        controller: 'docExpAsk_ImageModalCtrl',
                        backdrop: "static",
                        size: size,
                        resolve: {
                        }
                    });
                    initImage(1, 5);

                }
                $scope.$on("refreshimageData", function () {
                    imageFlag = true;
                    initImage(1, 5);
                });
                $scope.expertDocSearch = function () {
                    askFlag = true;
                    initExpertList(1, 5, 0);
                };
                $scope.getExpLevel = function (index) {
                    initExpertList(1,5,index);
                };
                // 选择医生
                $scope.selected2 = '';
                $scope.ChangeDoctor = function (item) {
                    if (item.checked) {
                        if (!$scope.selected2) $scope.selected2 = item;
                        if ($scope.selected2 !== item) item.checked = false;
                    } else {
                        $scope.selected2 = '';
                    }
                }
                $scope.stratBigConsult = function () {
                    addAsk();
                }

                institutionService.getProvinceData().then(function (res) {
                    $scope.provinces = res;
                    $scope.selectProvince= $scope.provinces[0];
                })
                institutionService.getCityData().then(function (res) {
                    $scope.allCitys = res;
                })
                institutionService.getDistrictData().then(function (res) {
                    $scope.allDistrict = res;
                })

                // 上传附件file
                $scope.$watch('files', function () {
                    $scope.upload($scope.files);
                });
                $scope.$watch('file', function () {
                    if ($scope.file != null) {
                        $scope.files = [$scope.file];
                    }
                });
                $scope.log = '';

                $scope.upload = function (files) {
                    if (files && files.length) {
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            if (!file.$error) {
                                Upload.upload({
                                    url: hostUrl +'/idoctor/service/card/uploadAttachment',
                                    data: {
                                        file: file,
                                        userid:userMessage[0].userid
                                    }
                                }).then(function (resp) {
                                    var result = resp.data.result;
                                    if(result == 0){
                                        var message = JSON.parse(resp.data.message);
                                        $scope.uploadMsg = "文件上传成功"
                                    }
                                    $timeout(function() {
                                        $scope.log = 'file: ' +
                                            resp.config.data.file.name +
                                            ', Response: ' + JSON.stringify(resp.data) +
                                            '\n' + $scope.log;
                                    });
                                }, null, function (evt) {
                                    var progressPercentage = parseInt(100.0 *
                                        evt.loaded / evt.total);
                                    $scope.log = 'progress: ' + progressPercentage +
                                        '% ' + evt.config.data.file.name + '\n' +
                                        $scope.log;
                                });
                            }
                        }
                    }
                };
                // 初始化影像列表
                function initImage(page, pageSize) {
                    //用于处理发起专家咨询时选择影像后切换页面后记住之前的选择的影像
                    var data = {
                        userid:userMessage[0].userid
                    };
                    data.havereport = -1;
                    data.haveask = -1;
                    var Img_advanceddataStr = localStorage.getItem("advanceddataKey");
                    var Img_advanceddata = JSON.parse(Img_advanceddataStr);
                    if (imageFlag) {
                        var truename = Img_advanceddata.truename;
                        var patientid = Img_advanceddata.patientid;
                        var uploadstarttime = Img_advanceddata.uploadstarttime;
                        var uploadendtime = Img_advanceddata.uploadendtime;
                        var studystarttime = Img_advanceddata.studystarttime;
                        var studyendtime = Img_advanceddata.studyendtime;
                        if (truename) {
                            data.truename = truename;
                        }

                        if (patientid) {
                            data.patientid = patientid;
                        }
                        if (uploadstarttime) {
                            data.uploadstarttime = uploadstarttime;
                        }
                        if (uploadendtime) {
                            data.uploadendtime = uploadendtime;
                        }
                        if (studystarttime) {
                            data.studystarttime = studystarttime;
                        }
                        if (studyendtime) {
                            data.studyendtime = studyendtime;
                        }
                        data.havereport = Img_advanceddata.havereport;
                        data.haveask = Img_advanceddata.haveask;
                    } else {
                        if ($scope.expImageCondition!=undefined) {
                            data.term = $scope.expImageCondition;
                        }
                    }

                    institutionService.getInstExpAskImage(data).then(function (res) {
                        var result = res.result;
                        var message = JSON.parse(res.message);
                        if (result == 0) {
                            // 总条数
                            $scope.totalItems = JSON.parse(res.message);
                        }
                        else if (result == -1) {
                            alert("获取用户数据失败");
                        } else {
                            alert("未知错误");
                        }
                    }), function (error) {
                        alert("服务器异常");
                    }
                    data.curpage =page;
                    data.pagesize = pageSize;
                    institutionService.getInstExpAskImageList(data).then(function (res) {
                        var result = res.result;
                        if (result == 0) {
                            var message = JSON.parse(res.message);
                            if (message) {
                                for (var i = 0; i < message.length; i++) {
                                    var obj = message[i];
                                    obj.imageurl =  file_url+"public/thumb/"+ obj.imageid+"/"+obj.thumb;
                                    obj.gender  = obj.sex==0?"男":"女";
                                    obj.age = institutionService.getAge(obj.birthday);
                                    var studydate = obj.studydate;
                                    studydate = studydate.substr(0, 4) + '-' + studydate.substr(4, 2) + '-' + studydate.substr(6, 2);
                                    obj.studydate = studydate;
                                    obj.selected = selectedImages.indexOf(obj.imageid+"")>-1;
                                    //专家和常规咨询个数
                                    getBigAskStatus(obj, i);
                                    getNormalAskStatus(obj, i);
                                }
                                $scope.expAskImages = message;
                            }

                        }
                    }), function (error) {
                    }
                }


                // 影像列表常专家询数量
                function getBigAskStatus(imageObj, index) {
                    var data = {};
                    data.imageid = imageObj.imageid;
                    data.curpage = 1;
                    data.pagesize = 100;
                    data.asktype = 0;
                    data.adduser = userMessage[0].userid;
                    institutionService.getInstExpAskStatus(data).then(function (res) {
                        var result = res.result;
                        if (result == 0) {
                            var message = JSON.parse(res.message);
                            if (message) {
                                var totalAsk = message.length;
                                imageObj.expCount = totalAsk;
                            }else if (result == -1) {
                                alert("获取影像数据失败");
                            } else {
                                alert("未知错误");
                            }
                        }
                    })
                        ,function (error) {
                        alert("服务器异常");
                    }
                }
                // 影像列表常规咨询数量
                function getNormalAskStatus(imageObj, index) {
                    var data = {};
                    data.imageid = imageObj.imageid;
                    data.curpage = 1;
                    data.pagesize = 100;
                    data.asktype = 0;
                    data.adduser = userMessage[0].userid ;
                    institutionService.getInstComAskStatus(data).then(function (res) {
                        var result = res.result;
                        if (result == 0) {
                            var message = JSON.parse(res.message);
                            if (message) {
                                var totalAsk = message.length;
                                imageObj.commonAskCount = totalAsk;
                            }else if (result == -1) {
                                alert("获取影像数据失败");
                            } else {
                                alert("未知错误");
                            }
                        }
                    })
                        ,function (error) {
                        alert("服务器异常");
                    }
                }
                // 初始化专家列表
                function initExpertList(page, pageSize, expertLevel) {
                    var searchData = {
                        instid: userMessage[0].userid ,
                        sortord:undefined
                    };
                    if (askFlag){
                        if ($scope.selectProvince!=undefined && $scope.selectProvince.code > 0) {
                            searchData.province = $scope.selectProvince.code;
                        }
                        if ($scope.selectCity!=undefined &&  $scope.selectCity.code > 0) {
                            searchData.city = $scope.selectCity.code;
                        }
                        if ($scope.selectDistrict!=undefined &&  $scope.selectDistrict.code > 0) {
                            searchData.area = $scope.selectDistrict.code;
                        }
                        // 所在医院 输入框 模糊查询
                        if ($scope.hospital) {
                            searchData.hospital = $scope.hospital;
                        }
                        // 科室
                        var deparmentVal = document.getElementById("ask-department").value;
                        if(deparmentVal!=''){
                            searchData.department = $scope.engineer.currentActivity.name;
                        }
                        // 医生职称
                        if($scope.doctor_title){
                            searchData.title = $scope.doctor_title;
                        }
                        // 医生名称
                        if ($scope.doctorname) {
                            searchData.truename = $scope.doctorname;
                        }
                    }
                    else{

                    }
                    // 表示查询所有专家
                    searchData.userlevel = expertLevel;
                    var count;
                    institutionService.getInstExpertDoctor(searchData).then(function (res) {
                        if (res.result == 0) {
                            var message = JSON.parse(res.message);
                            count = message;
                            initPageExpert(page, count, pageSize, searchData, expertLevel);
                        } else if (res.result == -1) {
                            alert("获取医生数据失败");
                        } else {
                            alert("未知错误");
                        }
                    }),
                        function (error) {
                            alert("服务器异常");
                        }
                }
                // 专家分页
                function initPageExpert(startPage, count, pageSize, data, expertLevel){
                    generateExpertList(data, startPage, pageSize, expertLevel);
                }
                // 专家咨询列表
                function generateExpertList(data, page, pageSize, expertLevel) {
                    data.curpage = page;
                    data.pagesize = pageSize;
                    data.userlevel = expertLevel;
                    institutionService.getGenerateExpertList(data).then(function (res) {
                        if (res.result == 0) {
                            var message = JSON.parse(res.message);
                            if (message) {
                                for (var i = 0; i <  message.length; i++) {
                                    var obj =  message[i];
                                    console.log("obj.headpic===|"+obj.headpic+"|");
                                    if(obj.headpic == null || obj.headpic == ""){
                                        obj.doctorHeadpic = "../../image/institution/avator.png" ;
                                    }else{
                                        obj.doctorHeadpic = file_url+"public/pic/"+ obj.userid+"/"+obj.headpic;
                                    }

                                    // 级别
                                    if (obj.userlevel == 1){
                                        obj.level = "海外专家";
                                    }else if (obj.userlevel == 2){
                                        obj.level = "全国顶级";
                                    } else if (obj.userlevel == 3) {
                                        obj.level = "全国知名";
                                    } else if (obj.userlevel == 4){
                                        obj.level = "省级知名";
                                    }
                                    // 性别
                                    if (obj.gender == 1) {
                                        obj.sex = '男';
                                    } else if (obj.gender == 2) {
                                        obj.sex = '女';
                                    }
                                }
                                $scope.consultExpDoctors = message;
                            }
                        }
                    })
                }
                // 发起咨询
                function addAsk(){
                    var imagestr = "";
                    imagestr = selectedImages.join(";")
                    if (imagestr == "" || imagestr == 'undefined') {
                        alert("请选择影像");
                        return;
                    }
                    if ($scope.selected2.checked == undefined) {
                        alert('请选择咨询医生');
                        return;
                    }
                    var doctorid = $scope.selected2.userid;
                    var cardid = "";
                    if($scope.asktitle == undefined){
                        alert('请输入咨询标题');
                        return;
                    }
                    if(parseInt($scope.patientAge)>0 &&parseInt($scope.patientAge)<150 &&!isNaN($scope.patientAge) ){

                    }else{
                        alert('请输入正确的年龄');
                        return;
                    }
                    if($scope.patitentHistory == undefined){
                        alert('请输入基本病史');
                        return;
                    }
                    if($scope.askquestion == undefined){
                        alert('请输入咨询的问题');
                        return;
                    }
                    var consultInfo = {
                        title:$scope.asktitle==undefined?'':$scope.asktitle,
                        targetuser:doctorid,
                        imagestr:imagestr,
                        cardid:cardid,
                        memo:$scope.patitentHistory == undefined?'':$scope.patitentHistory,
                        adduser: userMessage[0].userid ,
                        askid:0,
                        recommend:$scope.recommend == undefined?'':$scope.recommend,
                        askquestion:$scope.askquestion == undefined?'':$scope.askquestion,
                        degree:$scope.selectLevel.level,
                        status:1
                    };
                    institutionService.InstExpSure(doctorid).then(function (data){
                        var result = data.result;
                        var userDoctor =null,allSendMsg = {};
                        if(result == 0){
                            userDoctor = JSON.parse(data.message)[0];
                            allSendMsg = angular.extend(consultInfo,userDoctor)
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: 'docExpConsultSureModal.html',
                                controller: 'docExpConsultSureCtrl',
                                backdrop: "static",
                                resolve: {
                                    allSendInfo: function () {
                                        return allSendMsg
                                    }
                                }
                            });
                        }
                    })
                }


                // 上传附件
                $scope.$watch('files', function () {
                    $scope.upload($scope.files);
                });
                $scope.$watch('file', function () {
                    if ($scope.file != null) {
                        $scope.files = [$scope.file];
                    }
                });
                $scope.log = '';

                $scope.upload = function (files) {
                    if (files && files.length) {
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            if (!file.$error) {
                                Upload.upload({
                                    url: file_url + '/idoctor/service/card/uploadAttachment',
                                    data: {
                                        file: file,
                                        userid: 4
                                    }
                                }).then(function (resp) {
                                    var result = resp.data.result;
                                    if (result == 0) {
                                        var message = JSON.parse(resp.data.message);
                                        $scope.uploadMsg = "文件上传成功"
                                    }
                                    $timeout(function () {
                                        $scope.log = 'file: ' +
                                            resp.config.data.file.name +
                                            ', Response: ' + JSON.stringify(resp.data) +
                                            '\n' + $scope.log;
                                    });
                                }, null, function (evt) {
                                    var progressPercentage = parseInt(100.0 *
                                        evt.loaded / evt.total);
                                    $scope.log = 'progress: ' + progressPercentage +
                                        '% ' + evt.config.data.file.name + '\n' +
                                        $scope.log;
                                });
                            }
                        }
                    }
                };

            }])
        .controller("docExpAsk_ImageModalCtrl",["$scope",'$uibModalInstance','$uibModalInstance','$rootScope',function ($scope,$uibModalInstance,$uibModalInstance,$rootScope) {
            // 高级搜索时间
            $scope.uploadstartOptions = {
                startingDay: 1,
                showWeeks: false,
                maxDate: $scope.uploadendtime,

            };
            $scope.uploadendOptions = {
                startingDay: 1,
                showWeeks: false,
                minDate: $scope.uploadstarttime,
                maxDate: new Date()
            };

            $scope.studystarttimeOptions = {
                startingDay: 1,
                showWeeks: false,
                maxDate: $scope.studyendtime,

            };
            $scope.studyendtimeOptions = {
                startingDay: 1,
                showWeeks: false,
                minDate: $scope.studystarttime,
                maxDate: new Date()
            };

            $scope.$watch('uploadendtime', function (newValue, oldValue) {
                $scope.uploadstartOptions.maxDate = newValue;
            });
            $scope.$watch('uploadstarttime', function (newValue, oldValue) {
                $scope.uploadendOptions.minDate = newValue;
            });

            $scope.$watch('studyendtime', function (newValue, oldValue) {
                $scope.studystarttimeOptions.maxDate = newValue;
            });
            $scope.$watch('studystarttime', function (newValue, oldValue) {
                $scope.studyendtimeOptions.minDate = newValue;

            });
            var Img_advanceddata ={};
            $scope.ensureSearch = function () {
                var uploadstarttime = $("#uploadstarttime").val();
                var uploadendtime = $("#uploadendtime").val();
                var studystarttime = $("#studystarttime").val();
                var studyendtime = $("#studyendtime").val();
                var havereport = $("#image-havereport").val();
                var haveask = $("#image-haveask").val();
                Img_advanceddata = {
                    truename:$scope.image_truename == undefined ?'':$scope.image_truename,
                    patientid:$scope.image_imageid==undefined?'':$scope.image_imageid,
                    havereport:havereport,
                    haveask:haveask
                }
                if (uploadstarttime) {
                    uploadstarttime = uploadstarttime.substr(0, 4) + uploadstarttime.substr(5, 2) + uploadstarttime.substr(8, 2);
                    Img_advanceddata.uploadstarttime=uploadstarttime;
                }
                if (uploadendtime) {
                    uploadendtime = uploadendtime.substr(0, 4) + uploadendtime.substr(5, 2) + uploadendtime.substr(8, 2);
                    Img_advanceddata.uploadendtime=uploadendtime;
                }
                if (studystarttime) {
                    studystarttime = studystarttime.substr(0, 4) + studystarttime.substr(5, 2) + studystarttime.substr(8, 2);
                    Img_advanceddata.studystarttime=studystarttime;
                }
                if (studyendtime) {
                    studyendtime = studyendtime.substr(0, 4) + studyendtime.substr(5, 2) + studyendtime.substr(8, 2);
                    Img_advanceddata.studyendtime=studyendtime;
                }
                // $scope.$on("refreshimageData", function () {
                //     initImage(1, 5);
                // });
                $uibModalInstance.dismiss("高级搜索");
                localStorage.setItem("advanceddataKey",JSON.stringify(Img_advanceddata));
                $rootScope.$broadcast("refreshimageData");

            }
            $scope.cancelSearch = function () {
                $uibModalInstance.dismiss("取消高级搜索");
            }

            // 时间插件代码
            $scope.format = "yyyy-MM-dd ";
            $scope.altInputFormats = ['yyyy-M!/d!'];
            $scope.popup1 = {
                opened: false
            };
            $scope.popup2 = {
                opened: false
            };
            $scope.popup3 = {
                opened: false
            };
            $scope.popup4 = {
                opened: false
            };
            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };
            $scope.open2 = function () {
                $scope.popup2.opened = true;
            };
            $scope.open3 = function () {
                $scope.popup3.opened = true;
            };
            $scope.open4 = function () {
                $scope.popup4.opened = true;
            };
        }])
        .controller("docExpConsultSureCtrl", ["$scope", '$uibModalInstance', 'allSendInfo', 'institutionService',
            function ($scope, $uibModalInstance, allSendInfo, institutionService) {
                $scope.closeConsultSure = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.cancelExpConsult = function () {
                    $uibModalInstance.dismiss('cancel');
                }
                console.log("allSendInfo==",allSendInfo);
                $scope.asknumber = allSendInfo.asknumber;
                $scope.askexpert = allSendInfo.hospital + allSendInfo.truename + allSendInfo.title;
                $scope.askequestion = allSendInfo.askquestion;
                $scope.patitentHistory = allSendInfo.memo;
                $scope.ensureExpConsult = function () {
                    submitAsk();
                    $uibModalInstance.dismiss("cancel");

                }
                console.log("allSendInfo",allSendInfo);
                var sendExpConsultdata = {
                    asknumber:allSendInfo.asknumber,
                    imagestr: allSendInfo.imagestr,
                    doctorid: allSendInfo.userid,
                    cardid: allSendInfo.cardid,
                    title: allSendInfo.title,
                    targetuser: allSendInfo.userid,
                    memo: allSendInfo.memo,
                    adduser: allSendInfo.userid,
                    askid: allSendInfo.askid,
                    recommend: allSendInfo.recommend,
                    askquestion: allSendInfo.askquestion,
                    degree: allSendInfo.degree,
                    status: allSendInfo.status
                }

                function submitAsk() {
                    institutionService.InstMainsendExpConsult(JSON.stringify(sendExpConsultdata)).then(function (res) {
                        var result = res.result;
                        if (result == 0) {
                            alert("发送专家咨询成功！");
                            $uibModalInstance.close("发送专家咨询成功")
                        } else if (result == -1) {
                            alert("发送失败");
                        } else {
                            alert("未知错误");
                        }
                    })
                }

            }])
})(angular);