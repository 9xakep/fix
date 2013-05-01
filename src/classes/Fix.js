/*                           Класс Fix
 Основной класс, можно сказать ядро скрипта, умеет вешать заглушки и
 альтерантивные релизации на разные свойства, ему скармликаем паки CapsList
 __________________________________________________________________________*/

/** @constructor */
function Fix () {

	this.vendorPrefixes = ['WebKit', 'webkit', 'Moz', 'moz', 'ms', 'O'];

}


/**
 * @param {CapsList} capsList - список заглушек и альтернативных решений
 *
 */
Fix.prototype.addPropertyCaps = function (capsList) {

	var target = capsList.target;
	var caps = capsList.caps;

	if (!target) return;

	for (var key in caps) {
		if (key in target) continue;

		var detectedWorkingKey = this._detectWorkingKey(target, key);
		if (!detectedWorkingKey) {

			var cap = caps[key];

			if (cap) {
				target[key] = cap;
				continue
			}

			this._addWarningGetter(target, key);
			continue;
		}

		target[key] = target[detectedWorkingKey];
	}
};


Fix.prototype._addWarningGetter = function (target, key) {

	var _this = this;

	this._defineProperty(target, key, {

		get: function () {
			return _this._oldBrowser(target, key);
		},
		set: function (value) {

			_this._defineProperty(this, key, {
				value: value
			});

			return value;
		}
	});
};


/**
 * @see #addProxyCaps
 *
 * @param {Object} target
 * @param {string} key
 * @param {{ [value]:{Object}, [aliases]:string[], [set]:Function, [get]:Function }} capOptions
 * @param {Array} [capOptions.aliases]
 * @param {Function} capOptions.set
 * @param {Function} capOptions.get
 *
 * @private
 */
Fix.prototype._addProxyCap = function (target, key, capOptions) {

	var _this = this;
	var detectedWorkingKey;

	if (capOptions) {
		var aliases = capOptions.aliases;
		var alternativeValue = capOptions.value;
		var alternativeGetter = capOptions.get;
		var alternativeSetter = capOptions.set;
	}

	if (alternativeGetter || alternativeSetter) {
		var alternativeAssessors = true;
	}
	if (alternativeValue) {
		var alternativeImplementation = true;
	}

	this._defineProperty(target, key, {

		get: function () {
			if (!detectedWorkingKey) {
				detectedWorkingKey = _this._detectWorkingKey(this, key, aliases);

				if (!detectedWorkingKey) {
					if (alternativeAssessors) {
						return alternativeGetter.call(this);
					}
					if (alternativeImplementation) {
						return alternativeValue;
					}

					return _this._oldBrowser(target, key);
				}
			}
			return this[detectedWorkingKey];
		},

		set: function (value) {
			if (!detectedWorkingKey) {
				detectedWorkingKey = _this._detectWorkingKey(this, key, aliases);

				if (!detectedWorkingKey) {
					if (alternativeAssessors) {
						return alternativeSetter.call(this, value);
					}

					_this._oldBrowser(target, key);

					return value;
				}
			}
			return this[detectedWorkingKey] = value;
		}
	});
};


/**
 * Добавляет прокси заглушки на свойства.
 * После применения, при обращении к этим свойствам, если они не найдены, происходит поиск
 * их псевдонимов и аналогов с префиксами, если ни то ни другое не найдено, то используется
 * альтернативная реализация, елси альтернативной реализации нет, то
 * срабатывает событие "обнаружен старый браузер"
 *
 * @param {CapsList} capsList - список заглушек и альтернативных решений
 *
 * @public
 */
Fix.prototype.addProxyCaps = function (capsList) {

	var target = capsList.target;
	var caps = capsList.caps;

	if (!target) return;

	for (var key in caps) {
		if (key in target)continue;

		var capOptions = caps[key];
		this._addProxyCap(target, key, capOptions);
	}
};


Fix.prototype._defineProperty = function (target, key, description) {
	if ('defineProperty' in Object) {
		return Object.defineProperty(target, key, description);
	} else {
		this._oldBrowser(Object, 'Object.defineProperty');
	}
};


/**
 * Обнаруживает рабочий вариант свойства, проверяет свойство и все префиксные аналоги
 * и псевдонимы свойства, если рабочий вариант свойства обраружен, то возаращеется его ключ,
 * елси нет то false
 *
 * @param   {Object} target   - обьект со свойствами которого работаем
 * @param   {string} key      - имя свойства
 * @param   {Array} [aliases] - псевдонимы свойства если есть (не обязательный параметр)
 *
 * @returns {string|boolean}
 * @private
 */
Fix.prototype._detectWorkingKey = function (target, key, aliases) {

	var detectedPrefix = this._detectPrefix(target, key);

	if (detectedPrefix) {
		return this._attachPrefixToKey(detectedPrefix, key);
	}

	if (aliases) {

		for (var i = 0; i < aliases.length; i++) {

			var alias = aliases[i];

			if (alias in target) {
				return alias
			}

			var detectedAliasPrefix = this._detectPrefix(target, alias);

			if (detectedAliasPrefix) {
				return this._attachPrefixToKey(detectedAliasPrefix, alias);
			}

		}
	}

	return false;
};


/**
 * Обнаруживает аналог свойства key, но с префиксом и возвращает обнаруженый префикс
 *
 * @param   {Object} target - обьект со свойствами которого работаем
 * @param   {string} key    - ключ префикс к которому будем обнаруживать
 *
 * @returns {string|boolean}
 * @private
 */
Fix.prototype._detectPrefix = function (target, key) {

	var vendorPrefixes = this.vendorPrefixes;

	for (var i = 0; i < vendorPrefixes.length; i++) {

		var prefix = vendorPrefixes[i];
		var keyWithPrefix = this._attachPrefixToKey(prefix, key);

		if (keyWithPrefix in target) {
			return prefix;
		}
	}

	return false;
};


/**
 * Присоединяет префикс к ключу в стиле camelCase
 *
 * @param   {string} prefix - префикс
 * @param   {string} key    - ключ
 *
 * @returns {string} ключ с префиксом
 * @private
 */
Fix.prototype._attachPrefixToKey = function (prefix, key) {

	var first = key.substr(0, 1).toUpperCase();
	return prefix + first + key.substr(1);
};


/*
 * Перекрывает существующее свойство новым
 *
 * @param {string|Object} target  - обьект со свойствами которого работаем
 * @param {string}        key     - имя свойства
 * @param {Function}      handler - функция обертка, то что она вернет станет новым значением
 *                                  свойства, принимает первым параметром оригинальное
 *                                  значение свойства.
 *
 * @public
 */
Fix.prototype.override = function (options) {

	/*var target = this._getObjectFromPatch(options.target);
	 var caps = options.caps;

	 if (target === null) return;

	 for (var key in caps) {
	 var cap = caps[key];

	 var original = target[key];
	 target[key] = cap.handler(original);
	 }*/

};


Fix.prototype._oldBrowser = function (context, property) {

	if (Fix.onoldbrowserdetected instanceof Function) {
		Fix.onoldbrowserdetected(property);
	}

	/*Возвращаем функцию, чтобы максимально сохранить работоспособность приложений,
	 функция может и вызываться и является обьектом*/
	return function () {
	}
};


Fix.prototype.triggerDetectOldBrowser = function (property) {
	this._oldBrowser(null, property);
};

Fix.onoldbrowserdetected = null;