/**
 * Created by xiaoli on 2016/12/18.
 */

var $$ = Dom7;

var myApp = new Framework7();

var mainView = myApp.addView('.view-main');

var utils = {
    post: function (data, sf, ef, p) {
        var url = utils.postUrl();
        $$.ajax({
            url: url,
            async: true,
            method: 'POST',
            contentType: 'text/plain',
            crossDomain: true,
            data: data,
            success: function (e) {
                if ("function" == typeof sf)
                    sf(e, p);
            },
            error: function (e) {
                console.log(e);
                if ("function" == typeof ef)
                    ef(e, p);
            }
        });
    },
    get: function (url, sf, ef, p) {
        $$.ajax({
            url: url,
            async: true,
            method: 'GET',
            contentType: 'application/x-www-form-urlencoded',
            crossDomain: true,
            success: function (e) {
                if ('function' == typeof sf)
                    sf(e, p);
            },
            error: function (e) {
                if ('function' == typeof ef)
                    ef(e, p);
            }
        });
    }
}

var monitorMain = function () {
    var page, refreshContent, infiniteScroll, isLoading = false, isAreasLoading = false, data
        , templateStr, template, distreeData, cacheDatas = {}, isOperated = false, swipeout_item_data = {};

    /*
     * 获取模板文本
     * */
    $$.get("pages/monitor/monitor_main_tpl.html", function (data) {
        templateStr = data;
    });

    /*
     * 加载监控页面
     * */
    mainView.router.load(
        {
            url: 'pages/monitor/monitor_main.html'
        }
    );

    /*
     * 页面pageBeforeAnimation回调
     * */
    $$(document).on('pageBeforeAnimation', function (e) {
        var page = e.detail.page;
        if (page.name == "monitor_main") {
            beforeAnimal(page);
        }
    });

    /*
     * 页面pageBeforeAnimation回调执行动作
     * */
    function beforeAnimal(page) {
        var container = $$(page.container)
        container.find('.navbar').removeClass('navbar-hidden');
        container.find('.pull-to-refresh-content').css({'margin-top': '-44px', 'padding-bottom': '44px'});
        container.find('.pull-to-refresh-layer').css({'margin-top': '0'});
    }

    /*
     * 页面pageInit回调
     * */
    $$(document).on('pageInit', function (e) {
        page = e.detail.page;
        if (page.name == "monitor_main") {
            init(page);
        }
    });

    /*
     * 页面pageInit回调执行动作
     * */
    function init(p) {
        page = $$(p.container);
        refreshContent = page.find('.pull-to-refresh-content');
        infiniteScroll = page.find('.infinite-scroll');
        template = Template7.compile(templateStr);
        //查询数据
        beginQuery();
        //绑定事件
        bindEvent("on");
        //构建文本
        buildAreasBox(distreeData);
        // 缓存数据-保存数据到sessionStorage,缓存模块相关操作逻辑代码较多，此demo中已去除
        // sessionStorage.setItem("distreeData", JSON.stringify(distreeData));
    }

    /*
     * 查询数据
     * 先从缓存获取数据，缓存数据为空时再网络请求/模拟数据
     * 缓存模块相关操作逻辑代码较多，因缓存相关非此demo的重点，此demo中已去除
     * */
    function beginQuery() {
        // distreeData = JSON.parse(sessionStorage.getItem("distreeData"));
        if (distreeData == null) {
            // getMonitorAreasInfo("refresh");
            //无网络环境请求数据，此处自行组装模拟数据
            assembleAreasData("refresh");
        } else {
            buildAreasBox(distreeData);
        }
    }

    /*
     * 绑定／卸载事件
     * */
    function bindEvent(t) {
        var method = t == "on" ? t : "off";
        if (refreshContent) {
            //列表下拉刷新事件
            refreshContent[method]('refresh', refleshHandler);
        }
        if (infiniteScroll) {
            //列表上拉加载更多事件
            infiniteScroll[method]('infinite', loadMoreHandler);
        }
        if (page) {
            //二级列表打开／收缩事件
            page[method]('click', ".accordion-item-header", accordionToggle);
        }
    }

    /*
     * 构建列表文本
     * */
    function buildAreasBox(items) {
        data = items;
        var i, item, htmlstr = '', areaUl = page.find("#areas_ul");
        for (i = 0; i < items.length; i++) {
            item = items[i];
            htmlstr += template(item).trim();
        }
        //给列表插入文本
        areaUl.html(htmlstr);
    }

    /*
     * 渲染
     * 非此demo的重点，此demo中已去除相关代码
     * */
    function render(items) {
        cacheDatas = items;
        for (var key in items) {
            var el = page.find(".data-" + key);
            el.text(items[key]);
        }
    }

    /*
     * 查询数据
     * */
    function queryData() {
        if (isLoading) {
            resetState();
            return;
        }
        isLoading = true;
        // getMonitorAreasInfo("refresh");
        //无网络环境请求数据，此处自行组装模拟数据
        assembleAreasData("refresh");
    }

    /*
     * 重置状态
     * */
    function resetState() {
        isLoading = false;
        myApp.pullToRefreshDone();
        myApp.hideIndicator();
    }

    /*
     * destroy页面
     * */
    function destroyPage(p) {
        console.log("destroy warning main page");
        cacheDatas = {};
        bindEvent("off");
    }

    /*
     * 模拟一级列表（区域）数据
     * */
    function assembleAreasData(type) {
        distreeData = [];
        for (var i = 0; i < 12; i++) {
            var areaId = '0_' + i;
            var subsData = simulateEquipDatas(areaId);
            distreeData[i] = {
                item_area_index: i,
                item_area_id: areaId,
                item_area_name: '数控机床区' + i,
                item_equip_num: subsData.length,
                item_area_location: '华南地区／深圳分公司／' + i + '号厂房／中区',
                subs: subsData
            }
        }
    }

    /*
     * 模拟二级列表（设备）数据
     * */
    function simulateEquipDatas(areaId) {
        var equipsArr = [];
        for (var i = 0; i < 6; i++) {
            equipsArr[i] = {
                concerns_state_icon: "images/monitor/icon_concerns_no.png",
                isConcerned: false,
                btn_item_left_bg: 'darkorange',
                btn_item_left_text: '点击关注',
                device_id: '0_1_' + i,
                device_name: '数控切割机' + i,
                area_id: areaId
            }
        }
        return equipsArr;
    }

    /*
     * 网络请求一级列表（区域）数据
     * */
    function getMonitorAreasInfo(type) {
        var data = JSON.stringify('post_data');
        var params = {
            url: 'http://***',
            data: data
        }
        utils.post(params, function (e) {
            resetState();
            distreeData = [];
            // distreeData =
        }, function (e) {
            console.log("连接服务器失败，请检查网络");
            resetState();
        });
    }

    /*
     * 网络请求二级列表（设备）数据
     * */
    function getEquipsInfoByAreaId(area_id, _callback) {

        var data = {}
        data = JSON.stringify(data);
        var params = {
            url: 'http://***',
            data: data
        }
        utils.post(params, function (e) {
            var equipsArr = [];
            _callback(equipsArr);
        }, function (e) {
            console.log("连接服务器失败，请检查网络");
            resetState();
        });
    }

    /*
     * 二级列表打开／收缩事件
     * */
    function accordionToggle(e) {
        var item = $$(e.target).parents(".cusv1-accordion-item");
        if (item.length === 0) return;
        if (item.hasClass('accordion-item-expanded')) {
            item.find(".icon_to_expand_area").attr("src", "images/monitor/icon_arrow_to_right.png");
            myApp.accordionClosev1(item);
        } else {
            myApp.accordionOpenv1(item);
            item.find(".icon_to_expand_area").attr("src", "images/monitor/icon_arrow_to_bottom.png");
        }
    }

    /*
     * 刷新事件-列表下拉刷新
     * */
    function refleshHandler(e) {
        console.log("区域列表下拉刷新");

        myApp.showIndicator();

        queryData();

        myApp.hideIndicator();

        // 加载完毕需要重置
        myApp.pullToRefreshDone();
    }

    /*
     * 加载事件-列表上拉加载更多
     * */
    function loadMoreHandler(e) {
        console.log("区域列表上拉加载更多");

        // 如果正在加载，则退出
        if (isAreasLoading) return;

        // 设置flag
        isAreasLoading = true;

        //TODO  上拉加载对应操作
        // getMonitorAreasInfo('loadMore');
        //无网络环境请求数据，此处自行组装模拟数据
        // assembleAreasData("loadMore");
    }

    /*****************************************item侧滑处理-start********************************************/

    /*
     * item侧滑打开事件触发
     * 在item侧滑打开事件回调中获取当前item项数据
     * */
    $$(document).on('open', '.equip_according_list_item', function () {
        swipeout_item_data = {};
        swipeout_item_data[0] = $$(this).attr("data-device_id");
        swipeout_item_data[1] = $$(this).attr("data-isConcerned");
        swipeout_item_data[2] = $$(this).attr("data-device_name");
        swipeout_item_data[3] = $$(this).attr("data-area_id");
    });

    /*
     * 侧滑按钮点击事件
     * 在item侧滑按钮点击事件回调中处理数据变更
     * */
    $$(document).on('click', '.equips_item_swipeout_btn', function () {
        //获取当前item项
        var item = page.find(".equip_according_list_item[data-device_id ='" + swipeout_item_data[0] + "']");
        if (swipeout_item_data[1] == 'true') {
            item.attr('data-isConcerned', false);
            // TODO 对应数据库操作和缓存操作
        } else {
            item.attr('data-isConcerned', true);
            // TODO 对应数据库操作和缓存操作
        }
        isOperated = true;
    });

    /*
     * item侧滑关闭事件触发
     * 在item侧滑关闭事件回调中更新UI
     * 根据isOperated判断是否有点击侧滑按钮，处理对应逻辑
     * */
    $$(document).on('closed', '.equip_according_list_item', function (e) {
        if (isOperated) {
            //有点击侧滑按钮
            if (swipeout_item_data[1] == 'true') {
                //当前为关注状态时，点击后应更新UI为未关注状态
                $$(this).find('.expanded_equips_item_state').attr('src', 'images/monitor/icon_concerns_no.png');
                $$(this).find('.equips_item_swipeout_btn').css('background-color', 'darkorange');
                $$(this).find('.equips_item_swipeout_btn').text('点击关注');
                swipeout_item_data[1] = false;
            } else {
                //当前为未关注状态时，点击后应更新UI为关注状态
                $$(this).find('.expanded_equips_item_state').attr('src', 'images/monitor/icon_concerns_yes.png');
                $$(this).find('.equips_item_swipeout_btn').css('background-color', 'lightgray');
                $$(this).find('.equips_item_swipeout_btn').text('取消关注');
                swipeout_item_data[1] = true;
            }
            isOperated = false;
        } else {
            //未点击侧滑按钮

        }
    });

    /*****************************************item侧滑处理-end********************************************/

    return {
        init: init,
        beforeAnimal: beforeAnimal,
        resetState: resetState,
        refleshHandler: refleshHandler,
        loadMoreHandler: loadMoreHandler,
        bindEvent: bindEvent,
        destroyPage: destroyPage
    }
}();