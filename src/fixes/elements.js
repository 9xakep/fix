/*******************************************************************************************************
 *                         Создаем заглушки для свойств HTML элементов                                 *
 *                                                                                                     *
 *                                                                                                     *
 *******************************************************************************************************/


var propertyElement = new CapsList('Element.prototype', {

	'addEventListener': function (eventType, handler, useCapture) {
		var _this = this;

		return this.attachEvent('on' + eventType, function () {
			handler.apply(_this, arguments);
		}, useCapture);
	},

	'removeEventListener': function (eventType, handler, useCapture) {
		var _this = this;

		return this.detachEvent('on' + eventType, function () {
			handler.apply(_this, arguments);
		}, useCapture)
	},

	'onfullscreenchange': {
		aliases: ['onwebkitfullscreenchange', 'onmozfullscreenchange']
	},

	'onfullscreenerror': {
		aliases: ['onwebkitfullscreenerror', 'onmozfullscreenerror']
	},

	'onpointerlockchange': {
		aliases: ['onwebkitpointerlockchange', 'onmozfullscreenchange']
	},

	'onpointerlockerror': {
		aliases: ['onwebkitpointerlockerror', 'onmozfullscreenchange']
	}

});


var proxyElement = new CapsList('Element.prototype',

	{
		'createShadowRoot'   : null,
		'getRegionFlowRanges': null,
		'querySelectorAll'   : null,
		'matchesSelector'    : {
			value: function (selector) {
				var elements = this.parentNode.querySelectorAll(selector);

				for (var i = 0; i < elements.length; i++) {
					if (elements[i] === this) {
						return true;
					}
				}

				return false;
			}
		},
		'requestFullscreen'  : {
			aliases: ['requestFullScreen']
		},
		'requestPointerLock' : null
	}
);


var proxyDocument = new CapsList('document', {

	'cancelFullscreen'  : {
		aliases: ['cancelFullScreen', 'exitFullScreen', 'exitFullscreen']
	},
	'exitPointerLock'   : {
		aliases: ['exitPointerlock', 'cancelPointerLock', 'cancelPointerlock']
	},
	'pointerLockElement': null
});


var overrideElement = (function () {

	var prefixes = ['webkit', 'moz'];

	function cap (original) {
		return function (name, handler, bo) {

			for (var i = 0; i < prefixes.length; i++) {
				original.call(this, prefixes[i] + name, handler, bo);
			}

			original.apply(this, arguments);
		}
	}

	return new CapsList('Element.prototype', {

		'addEventListener'   : cap,
		'removeEventListener': cap
	});
})();