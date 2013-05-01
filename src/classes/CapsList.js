function CapsList (target, caps) {

	this.target = this._getTargetObject(target);
	this.caps = caps;

}


CapsList.oncantgettarget = null;
CapsList.cantReadPropertiesList = [];


CapsList.addEventListener = function (handler) {

	var properties = CapsList.cantReadPropertiesList;

	if (properties.length) {
		for (var i = 0; i < properties.length; i++) {
			handler.call(CapsList, properties[i]);
		}
	}

	CapsList.oncantgettarget = handler;
};


CapsList._cantReadProperty = function (key) {

	if (CapsList.oncantgettarget instanceof Function) {
		CapsList.oncantgettarget(key)
	}
	else {
		CapsList.cantReadPropertiesList.push(key);
	}
};


/**
 * Пытается получить обьект по пути, елси не выходит то старый браузер обнаружен
 *
 * @param   {string|Object} patch - путь до обьекта 'foo.bar.baz' либо сразу ссылка на обьект
 *
 * @returns {Object|null} либо полученый обьект, либо null
 * @private
 */
CapsList.prototype._getTargetObject = function (patch) {

	if (typeof patch !== 'string') return patch;

	var context = window;
	var keys = patch.split('.');

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];

		if (context[key] === undefined || context[key] === null) {
			CapsList._cantReadProperty(key);
			return null;
		}

		context = context[key];
	}

	return context
};