/*                           Класс CapsList

 Описывает интерфейс для паков альтернативных реализаций свойств
 __________________________________________________________________________*/

/**
 * Список альтернативных реализаций свойств, для браузеров которые их не поддерживают.
 *
 * @param {Object|string} target - глобальный путь до обьекта в котором будем реализовывать свойства.
 * @param {Object} caps - список альтернативных решений //TODO сделать пиздатое описание
 *
 * @see Fix#addPropertyCaps|Fix#addProxyCaps
 * @constructor
 */
function CapsList (target, caps) {

	if (typeof target === 'string') {
		target = this._getObjectFromPatch(target);
	}

	this.target = target;
	this.caps = caps;

}


/**
 * @type {Function|null} - установленный обработчик события "oncantgettarget"
 *
 * @static
 */
CapsList.oncantgettarget = null;


/**
 * @type {Array} - бцфер в котором накапливаются пути, по которым не удалось получить обьекты,
 * до тех пор пока не установиться обработчик события "oncantgettarget",
 * потом этот обработчик пробегается по ним всем сразу.
 *
 * @static
 */
CapsList.cantReadPropertiesList = [];


/**
 * Добавляет обрчботчик единственного события "oncantgettarget"(не могу получить цель).
 * Так же, если нель не могла быть получена еще ДО установки обработчика, то пути до целей
 * помещались в буфер, и если он не пустой, то обработчик вызовется для каждого путя из буфера.
 *
 * @param {Function} handler - обрыботчик, принимает первым параметром путь до цели которую
 * не удалось получить.
 *
 * @static
 */
CapsList.addEventListener = function (handler) {

	var properties = CapsList.cantReadPropertiesList;

	if (properties.length) {
		for (var i = 0; i < properties.length; i++) {
			handler.call(CapsList, properties[i]);
		}
	}

	CapsList.oncantgettarget = handler;
};


/**
 * Вызывает обработчик событие "oncantgettarget" и передает в него первым параметром
 * путь до свойства которое не удалось получить. Если обработчик не установлен,
 * то кладет этот путь в буфер. И если потом обработчик будет установлен то все
 * такие "пути" из буфера будут им обработаны.
 *
 * @param {string} patchToProperty - путь до свойства которое не удалось получить
 *
 * @private
 */
CapsList._cantReadProperty = function (patchToProperty) {

	if (CapsList.oncantgettarget instanceof Function) {
		CapsList.oncantgettarget(patchToProperty)
	}
	else {
		CapsList.cantReadPropertiesList.push(patchToProperty);
	}
};


/**
 * Возвращает обьект по пути (относительно глобального обьекта).
 *
 * @param   {string} patch - путь до обьекта в стиле 'foo.bar.baz'
 *
 * @returns {Object|null} либо полученый обьект, либо null
 * @private
 */
CapsList.prototype._getObjectFromPatch = function (patch) {

	var context = window;
	var keys = patch.split('.');
	var currentPatch = [];

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];

		currentPatch.push(key);

		if (context[key] === undefined || context[key] === null) {
			var patchToProperty = currentPatch.join('.');
			CapsList._cantReadProperty(patchToProperty);

			return null;
		}

		context = context[key];
	}

	return context
};