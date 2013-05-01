/*              Создаем заглушки для свойств обьектов событий
 __________________________________________________________________________*/

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