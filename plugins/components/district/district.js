/**
 * districts.js
 * https://github.com/jundayw/districts
 *
 * 插件扩展联动功能
 * @Author:Mr.Alex
 * @Email:<mail@wangqiqiang.com>
 * @version:2.0.0
 * @date:2020-08-30 18:30:07
 *
 * @demo:$('[name=province_code],[name=city_code],[name=country_code]').districts({data:ChineseDistricts});
 */
(function(window, $, undefined) {
	$.fn.districts = function(options, plugin) {
		var elements = this.selector.split(',');
		var defaults = {
			data: [],
			target: 'rel-target',
			option: 'rel-option',
			index: '-1',
			callback: function(element, data, checked){
				//console.log('callback:element', element);
				//console.log('callback:data', data);
				//console.log('callback:checked', checked);
			},
			map: {
				id: 'value',
				text: 'text',
				children: 'children'
			}
		};
		// 合并参数
		var options = $.extend(defaults, options, {
			load: 'load',
			change: 'change',
		});
		// 可扩展的实现方法
		var plugin = plugin || function(element, items, checked) {
			var list = new Array();
			var value = options.index;
			list.push({
				id: options.index,
				text: $(element).data('placeholder')
			});
			for (var key in items) {
				list.push({
					id: items[key][options.map.id],
					text: items[key][options.map.text]
				});
				if( items[key][options.map.id] == checked ){
					value = checked;
				}
			}
			$(element).empty().select2({
				data: list
			}).val(value).trigger(options.change);
		};
		// 数据获取方法
		var data = function(data, option, children) {
			if (data[options.map.id] == option) {
				if(children){
					return data.hasOwnProperty(options.map.children) ? data[options.map.children] : data;
				}else{
					return data;
				}
			}
			if (data.hasOwnProperty(options.map.children) == false) {
				return false;
			}
			for (var key in data[options.map.children]) {
				if (regon = arguments.callee(data[options.map.children][key], option, children)) {
					return regon;
				}
			}
			return false;
		};
		// 构建方法
		var build = function(element, checked) {
			// 获取数据
			var items = function(option, children) {
				if (option == undefined) {
					return options.data;
				}
				if (option == options.index) {
					return [];
				}
				for (var key in options.data) {
					if (regon = data(options.data[key], option, children)) {
						return regon;
					}
				}
				return [];
			};
			// 目标事件绑定
			$(element).unbind(options.change).bind(options.change, function() {
				var checked = $(element).children('option:selected').val();
					// 回调支持
					options.callback(element, items(checked, false), checked);
				// 目标事件传递
				if (target = $(element).attr(options.target)) {
					return build(target, checked);
				}
			});
			// 开始构建结构
			return plugin(element, items(checked, true), $(element).attr(options.option) || options.index);
		}
		// 触发第一个元素的加载事件
		$(elements.slice(0, 1).join()).unbind(options.load).bind(options.load, function() {
			return build(elements.slice(0, 1).join(), undefined);
		}).trigger(options.load);
		// 返回jQuery对象
		return this;
	}
})(window, jQuery);
