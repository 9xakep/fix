var proxyEvent = (function () {

	function hash (value) {
		var index = hash.elements.indexOf(value);
		if (index === -1) {
			index = hash.elements.push(value) - 1;
		}
		return '_hash:' + index
	}

	hash.elements = [];
	hash.oldEventCoordinates = [];


	function movement (event, axis) {
		var hashElement = hash(event.target);
		var oldCoordinates = hash.oldEventCoordinates[hashElement];

		if (oldCoordinates === undefined) {
			oldCoordinates = {x: 0, y: 0};

			if (event.type == 'mousemove') {
				hash.oldEventCoordinates[hashElement] = oldCoordinates;
			}
		}

		var currentPosition = event['screen' + axis.toUpperCase()];
		var movement = currentPosition - oldCoordinates[axis];
		oldCoordinates[axis] = currentPosition;

		return movement;
	}


	return new CapsList('Event.prototype', {

		'movementX': {
			get: function () {
				return movement(this, 'x');
			}
		},
		'movementY': {
			get: function () {
				return movement(this, 'y');
			}
		}
	});

})();


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