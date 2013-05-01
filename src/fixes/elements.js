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


