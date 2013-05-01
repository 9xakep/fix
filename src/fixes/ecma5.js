/*
 Переопределим defineProperty для IE8, так как там он работает только с родными элементами.
 Если был вызван не относительно родного обьекта и выбросил исключение,
 то перед выбросом исключением срабатывает событие обнаружен старый браузер
 */
var objectDefineProperty = new CapsList('Object', {

	'defineProperty': function (defineProperty) {
		return function (target) {

			try {
				return defineProperty.apply(this, arguments);

			} catch (error) {

				var isWindow = target === window;
				var isHTMLDocument = target instanceof window.HTMLDocument;
				var isElement = target instanceof window.Element;
				var isEvent = target instanceof window.Event;

				var condition = !isWindow && !isHTMLDocument && !isElement && !isEvent;

				if (condition) {
					fix.triggerDetectOldBrowser('defineProperty');
				}

				throw error;
			}
		}
	}
});


var propertyFunction = new CapsList('Function.prototype', {

	'bind': function (oThis) {

		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {
			},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis
					? this
					: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	}
});


var propertyArray = new CapsList('Array.prototype', {

	'indexOf': function (value) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === value) return i;
		}
		return -1;
	}
});