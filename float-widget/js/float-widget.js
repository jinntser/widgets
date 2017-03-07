/*************************************
 ***  Created by JZ on 2017/02/27  ***
 ***  JZlider ver.0.3.02.27        ***
 ************************************/


(function ($) {
    function _fn(target, opt) {
        var _target = target,
            settings = {
                offset: 30,
                menu: '',
                idle: true,
                idleTime: 3000,
                custom: {
                    menuClass: 'float-widget-menu',
                    widgetClass: 'float-widget',
                    activeClass: ['float-widget-open-t', 'float-widget-open-r', 'float-widget-open-b', 'float-widget-open-l']
                }
            },
            env = {
                w: 0,
                h: 0,
                edge_t: 0,
                edge_r: 0,
                edge_b: 0,
                edge_l: 0
            },
            widget = {
                w: 0,
                h: 0,
                x: 0,
                y: 0,
                drag_s_x: 0,
                drag_s_y: 0,
                drag_e_x: 0,
                drag_e_y: 0,
                active: false,
                idle: null
            };
        $.extend(settings, opt);
        get_paras();

        //設定參數
        var menuClass = settings.custom.menuClass,
            widgetClass = settings.custom.widgetClass,
            activeClasses = settings.custom.activeClass,
            idleClass = 'idle';
        if (settings.menu != '') {
            var $menu = $(settings.menu);
            $menu.addClass(menuClass);
        }

        //綁定事件
        if ('createTouch' in document) {
            _target[0].addEventListener('touchstart', _down, false);
        } else {
            $(document).on({'mousedown': _down});
        }

        //初始化
        _target.addClass(widgetClass);
        $('body').css('min-height', env.h);
        //閒置隱藏
        if (settings.idle && widget.idle===null) {
            widget.idle = setTimeout(function () {
                _target.addClass(idleClass);
                widget.idle = null;
            }, settings.idleTime);
        }

        //初始化屬性
        function get_paras() {
            var h = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight,
                w = window.innerWidth
                    || document.documentElement.clientWidth
                    || document.body.clientWidth;
            $.extend(widget, {
                w: parseInt(_target.width()),
                h: parseInt(_target.height()),
                x: parseInt(_target[0].offsetLeft),
                y: parseInt(_target[0].offsetTop)
            });
            $.extend(env, {
                w: w,
                h: h,
                edge_t: (typeof settings.offset == 'object') ? settings.offset[0] : settings.offset,
                edge_r: w - widget.w - ((typeof settings.offset == 'object') ? settings.offset[1] : settings.offset),
                edge_b: h - widget.h - ((typeof settings.offset == 'object') ? settings.offset[2] : settings.offset),
                edge_l: (typeof settings.offset == 'object') ? settings.offset[3] : settings.offset
            });
        }

        //關閉menu動作
        function closemenu(e) {
            var $target = $(e.target);
            if (!$target.is($menu) && !$target.closest($menu).length) {
                activeClasses.map(function (obj) {
                    _target.removeClass(obj);
                    $menu.removeClass(obj);
                });
                $menu.hide(300, function () {
                    //閒置隱藏
                    if (settings.idle && widget.idle===null) {
                        // console.log('關閉menu 開始倒數', widget.idle)
                        widget.idle = setTimeout(function () {
                            _target.addClass(idleClass);
                            widget.idle = null;
                        }, settings.idleTime);
                    }
                });
                if ('createTouch' in document) {
                    document.removeEventListener('touchstart', closemenu, false);
                } else {
                    $(document).off({'click': closemenu});
                }
            }
        }

        function _down(e) {
            var $target = $(e.target);
            if ('createTouch' in document){
                $('body').addClass('locked');
            }
            //判斷是否按到menu
            if ($target.is($menu) || $target.parents('.' + menuClass).length) {
                return false
            }
            //判斷是否為按鈕
            if ($target.is(_target) || $target.parents('.' + widgetClass).length > 0) {
                e.preventDefault();
                //閒置隱藏
                _target.removeClass(idleClass);
                if (settings.idle && widget.idle !== null) {
                    // console.log('按下 清除', widget.idle)
                    clearTimeout(widget.idle);
                    widget.idle = null;
                }
                if ('createTouch' in document) {
                    document.addEventListener('touchmove', _drag, false);
                    document.addEventListener('touchend', _up, false);
                } else {
                    $(document).on({
                        'mousemove': _drag,
                        'mouseup': _up
                    });
                }
                get_paras();
                $.extend(widget, {
                    drag_s_x: ('createTouch' in document) ? e.touches[0].clientX : e.clientX,
                    drag_s_y: ('createTouch' in document) ? e.touches[0].clientY : e.clientY
                });
                // console.log('物件現在位置(css): ' + _target[0].offsetTop + ', 按下位置: ' + e.clientY + '物件狀態(y): ' + widget.y)
                // console.log(env)
                // console.log(widget)
            }
        }

        function _drag(e) {
            e.preventDefault();
            if ($menu.length && $menu.is(':visible')) {
                $menu.hide(300);
                if ('createTouch' in document) {
                    document.removeEventListener('touchstart', closemenu, false);
                } else {
                    $(document).off({'click': closemenu});
                }
            }
            //移動
            _target.css({
                'left': (('createTouch' in document) ? e.touches[0].clientX : e.clientX) - widget.drag_s_x + widget.x,
                'top': (('createTouch' in document) ? e.touches[0].clientY : e.clientY) - widget.drag_s_y + widget.y
            });
            // console.log(e.touches[0].clientX, e.touches[0].clientY)
        }

        function _up(e) {
            widget.x = (_target[0].offsetLeft < env.edge_l) ? env.edge_l : (_target[0].offsetLeft > env.edge_r) ? env.edge_r : _target[0].offsetLeft;
            widget.y = (_target[0].offsetTop < env.edge_t) ? env.edge_t : (_target[0].offsetTop > env.edge_b) ? env.edge_b : _target[0].offsetTop;
            _target.animate({
                'left': widget.x,
                'top': widget.y
            }, 200);
            $('body').removeClass('locked');
            //閒置隱藏
            if (settings.idle && widget.idle===null) {
                // console.log('放開 開始倒數', widget.idle)
                widget.idle = setTimeout(function () {
                    _target.addClass(idleClass);
                    widget.idle = null;
                }, settings.idleTime);
            }
            if (Math.abs(('createTouch' in document ? e.changedTouches[0].clientX : e.clientX) - widget.drag_s_x) < 3 && Math.abs(('createTouch' in document ? e.changedTouches[0].clientY : e.clientY) - widget.drag_s_y) < 3 && $menu.length) {
                var $target = $(e.target);
                if (!$target.is($menu) && !$target.parents('.' + menuClass).length && $menu.is(':hidden')) {
                    var midX = (env.w - widget.w) / 2,
                        midY = (env.h - widget.h) / 2;
                    if (widget.x > midX) {
                        $menu.css({left: 'auto', right: widget.w + 15}).addClass(activeClasses[1]);
                        _target.addClass(activeClasses[1]);
                    } else {
                        $menu.css({left: widget.w + 15, right: 'auto'}).addClass(activeClasses[3]);
                        _target.addClass(activeClasses[3]);
                    }
                    if (widget.y > midY) {
                        $menu.css({top: 'auto', bottom: 0}).addClass(activeClasses[2]);
                        _target.addClass(activeClasses[2]);
                    } else {
                        $menu.css({top: 0, bottom: 'auto'}).addClass(activeClasses[0]);
                        _target.addClass(activeClasses[0]);
                    }
                    $menu.show(300, function () {
                        //閒置隱藏
                        if (settings.idle && widget.idle!==null) {
                            // console.log('打開menu 清除', widget.idle)
                            clearTimeout(widget.idle);
                            widget.idle = null;
                        }
                        if ('createTouch' in document) {
                            document.addEventListener('touchstart', closemenu, false);
                        } else {
                            $(document).on({'click': closemenu});
                        }
                    });
                }
            }
            if ('createTouch' in document) {
                document.removeEventListener('touchmove', _drag, false);
                document.removeEventListener('touchend', _up, false);
            } else {
                $(document).off({
                    'mousemove': _drag,
                    'mouseup': _up
                });
            }
        }

        $(window).resize(function () {
            setTimeout(function () {
                get_paras();
                widget.x = (_target[0].offsetLeft < env.edge_l) ? env.edge_l : (_target[0].offsetLeft > env.edge_r) ? env.edge_r : _target[0].offsetLeft;
                widget.y = (_target[0].offsetTop < env.edge_t) ? env.edge_t : (_target[0].offsetTop > env.edge_b) ? env.edge_b : _target[0].offsetTop;
                _target.animate({
                    'left': widget.x,
                    'top': widget.y
                }, 200);
            }, 200)
        })

    }

    $.fn.extend({
        floatWidget: function (opt) {
            return this.each(function () {
                _fn($(this), opt);
            });
        }
    });
})(jQuery);
