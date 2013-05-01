/*******************************************************************************************************
 *                                         Класс CapsList                                              *
 *                                                                                                     *
 * Описывает интерфейс для паков альтернативных реализаций свойств                                     *
 *                                                                                                     *
 *                                                                                                     *
 *******************************************************************************************************/


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


/*                           Класс Notification

 Класс создает вверху страницы окно уведомленя о том что браузер устарел,
 какие свойства не поддерживаются, ссылки на скачку нормальных браузеров и.т.п.
 _______________________________________________________________________________*/

/**
 * Создает блок вверху страницы уведомляющий человека о том что его браузер устарел
 * @constructor
 */
function Notification () {

	var _this = this;

	// основное окно-контейнер, появляется вверху страницы
	var HTMLContainer = this._createElement('div', {
		'display'        : 'block',
		'position'       : 'fixed',
		'width'          : '100%',
		'height'         : 'auto',
		'overflow'       : 'hidden',
		'top'            : '0',
		'left'           : '0',
		'fontFamily'     : 'Tahoma, Verdana, Arial, sans-serif',
		'color'          : 'white',
		'textShadow'     : '0 1px 2px #000',
		'textAlign'      : 'center',
		'backgroundColor': '#444',
		'boxShadow'      : '0 0 20px #000',
		'zIndex'         : '2147483647' // max z-index
	});


	// заголовок с предупреждением
	var HTMLHeader = this._createElement('h1', {
		'display'   : 'block',
		'width'     : '100%',
		'margin'    : '10px',
		'fontWeight': '100',
		'fontSize'  : '20px',
		'textAlign' : 'center'
	});
	HTMLHeader.innerHTML = Notification.HEADER_TEXT;


	// ссылка на скачку хрома
	var HTMLChrome = this._createElement('a', {
		'display'             : 'inline-block',
		'padding'             : '85px 0 10px',
		'margin'              : '10px 0 0',
		'width'               : '200px',
		'border'              : '5px solid #333',
		'color'               : '#333',
		'backgroundAttachment': 'scroll',
		'backgroundPosition'  : '50% 15px',
		'backgroundRepeat'    : 'no-repeat',
		'backgroundImage'     : 'url(//vk.com/images/chrome.gif)',
		'backgroundColor'     : 'rgb(242, 244, 255)',
		'cursor'              : 'pointer',
		'textShadow'          : 'none'
	});
	HTMLChrome.innerHTML = 'Google Chrome';
	HTMLChrome.href = '//www.google.com/chrome/';


	// контейнер для кнопки показа деталей
	var HTMLShowDetailsP = this._createElement('p', {
		'display'  : 'block',
		'width'    : '100%',
		'padding'  : '0 10px 5px',
		'color'    : '#999',
		'textAlign': 'left'
	});


	// кнопка показа деталей
	var HTMLShowDetailsSpan = this._createElement('span', {
		'display'       : 'inline',
		'width'         : 'auto',
		'color'         : '#999',
		'textDecoration': 'underline',
		'fontSize'      : '17px',
		'cursor'        : 'pointer'
	});
	HTMLShowDetailsSpan.innerHTML = Notification.DETAILS_TEXT;
	HTMLShowDetailsSpan.onclick = function () {
		_this._onclickDetails();
	};


	// список деталей
	var HTMLDetailsList = this._createElement('ul', {
		'display'  : 'none',
		'margin'   : '10px 50px',
		'listStyle': 'square outside',
		'fontSize' : '20px',
		'textAlign': 'left'
	});


	// кнопка закрытия всего окна
	var HTMLCloseButton = this._createElement('div', {
		'display'        : 'block',
		'width'          : '100%',
		'height'         : '25px',
		'color'          : 'white',
		'fontSize'       : '20px',
		'borderBottom'   : '1px solid #555',
		'textAlign'      : 'center',
		'backgroundColor': '#333',
		'cursor'         : 'pointer'
	});
	HTMLCloseButton.innerHTML = Notification.CLOSE_TEXT;
	HTMLCloseButton.onclick = function () {
		_this.close();
	};


	// соберем все вместе
	HTMLContainer.appendChild(HTMLHeader);
	HTMLContainer.appendChild(HTMLChrome);
	HTMLShowDetailsP.appendChild(HTMLShowDetailsSpan);
	HTMLContainer.appendChild(HTMLShowDetailsP);
	HTMLContainer.appendChild(HTMLDetailsList);
	HTMLContainer.appendChild(HTMLCloseButton);


	this.isOpened = false;
	this.isOpenedDetails = false;
	this.detailsList = [];

	this.HTMLContainer = HTMLContainer;
	this.HTMLHeader = HTMLHeader;
	this.HTMLChrome = HTMLChrome;
	this.HTMLShowDetailsP = HTMLShowDetailsP;
	this.HTMLShowDetailsSpan = HTMLShowDetailsSpan;
	this.HTMLDetailsList = HTMLDetailsList;
	this.HTMLCloseButton = HTMLCloseButton;

}


Notification.HEADER_TEXT = 'Вообще-то, ваш браузер довольно сильно устарел.<br>Для нормального просмотра сайта обновите его например на:';
Notification.DETAILS_TEXT = 'Что именно не поддерживает мой браузер?';
Notification.CLOSE_TEXT = 'закрыть';


Notification.prototype._createElement = function (tag, css) {
	var element = document.createElement(tag);

	// небольшой сброс стилей
	element.style.backgroundColor = 'transparent';
	element.style.border = 'none';
	element.style.margin = '0';
	element.style.padding = '0';

	for (var property in css) {
		element.style[property] = css[property];
	}

	return element;
};


Notification.prototype.addMessage = function (detail) {
	var detailsList = this.detailsList;

	for (var i = 0; i < detailsList.length; i++) {
		if (detail === detailsList[i]) return
	}

	detailsList.push(detail);
	this._addDetail(detail);

	this.open();
};


Notification.prototype.open = function () {
	var _this = this;
	var HTMLContainer = this.HTMLContainer;
	var body = document.body;
	var userAgent = navigator.userAgent;
	var isOpened = this.isOpened;

	if (isOpened === true) return;

	/* В старых версиях ишака надо чтобы заглушка была первым элементом в body
	 чтобы она показывалась ВВЕРХУ страницы, в остальных же браузерах, в опере
	 например, в полноэкранном режиме заглушка будет показываться поверх
	 полноэкранного элемента только если она расположена ПОСЛЕ него в документе.*/
	if (/MSIE/.test(userAgent)) {
		if (body) {
			body.insertBefore(HTMLContainer, body.firstChild);
		} else {
			window.onload = function () {
				_this.open()
			};
			return;
		}
	}
	else {
		body.appendChild(HTMLContainer);
	}

	this.isOpened = true;
};


Notification.prototype.close = function () {
	var HTMLContainer = this.HTMLContainer;
	var HTMLNotifyList = this.HTMLDetailsList;
	var isOpened = this.isOpened;

	if (isOpened === false) return;

	HTMLContainer.parentNode.removeChild(HTMLContainer);
	HTMLNotifyList.innerHTML = '';
};


Notification.prototype._onclickDetails = function () {
	var HTMLDetailsList = this.HTMLDetailsList;
	var isOpenedDetails = this.isOpenedDetails;

	if (isOpenedDetails) {
		HTMLDetailsList.style.display = 'none';
	}
	else {
		HTMLDetailsList.style.display = 'block';
	}

	this.isOpenedDetails = !isOpenedDetails;

	return false;
};


Notification.prototype._addDetail = function (messageText) {
	var HTMLNotifyList = this.HTMLDetailsList;
	var HTMLMessage = document.createElement('li');

	HTMLMessage.innerHTML = messageText;
	HTMLNotifyList.appendChild(HTMLMessage);
};


/*                 Создаем заглушки для element.style

 По сути альтернативрую реализацию сделать затруднительно, по этому в основном
 просто передаем в качестве заглушки null, по этому Fix просто поищет
 вендорные аналоги и если что то будет проксировать обращение к этим свойствам
 на них, если вендорных не найдется, то получим хотя бы уведомление о том что
 браузер устарел.

 TODO Возможно в будущем надо будет добавить 2 уровня warning и error,
 потому что не совсем справедливо показывать уведомление что браузер устарел
 только из-за того что какое-то css свойство не поддерживается.
 ______________________________________________________________________________*/

var proxyCss = new CapsList('CSSStyleDeclaration.prototype',

	{
		"alignContent"            : null,
		"alignItems"              : null,
		"alignSelf"               : null,
		"animation"               : null,
		"animationDelay"          : null,
		"animationDirection"      : null,
		"animationDuration"       : null,
		"animationFillMode"       : null,
		"animationIterationCount" : null,
		"animationName"           : null,
		"animationPlayState"      : null,
		"animationTimingFunction" : null,
		"appRegion"               : null,
		"appearance"              : null,
		"aspectRatio"             : null,
		"backfaceVisibility"      : null,
//		"backgroundClip"          : null,
		"backgroundComposite"     : null,
		"backgroundOrigin"        : null,
		"backgroundSize"          : null,
		"borderAfter"             : null,
		"borderAfterColor"        : null,
		"borderAfterStyle"        : null,
		"borderAfterWidth"        : null,
		"borderBefore"            : null,
		"borderBeforeColor"       : null,
		"borderBeforeStyle"       : null,
		"borderBeforeWidth"       : null,
		"borderEnd"               : null,
		"borderEndColor"          : null,
		"borderEndStyle"          : null,
		"borderEndWidth"          : null,
		"borderFit"               : null,
		"borderHorizontalSpacing" : null,
		"borderImage"             : null,
		"borderRadius"            : null,
		"borderStart"             : null,
		"borderStartColor"        : null,
		"borderStartStyle"        : null,
		"borderStartWidth"        : null,
		"borderVerticalSpacing"   : null,
		"boxAlign"                : null,
		"boxDecorationBreak"      : null,
		"boxDirection"            : null,
		"boxFlex"                 : null,
		"boxFlexGroup"            : null,
		"boxLines"                : null,
		"boxOrdinalGroup"         : null,
		"boxOrient"               : null,
		"boxPack"                 : null,
		"boxShadow"               : null,
		"clipPath"                : null,
		"colorCorrection"         : null,
		"columnAxis"              : null,
		"columnBreakAfter"        : null,
		"columnBreakBefore"       : null,
		"columnBreakInside"       : null,
		"columnCount"             : null,
		"columnGap"               : null,
		"columnProgression"       : null,
		"columnRule"              : null,
		"columnRuleColor"         : null,
		"columnRuleStyle"         : null,
		"columnRuleWidth"         : null,
		"columnSpan"              : null,
		"columnWidth"             : null,
		"columns"                 : null,
		"filter"                  : null,
		"flex"                    : null,
		"flexBasis"               : null,
		"flexDirection"           : null,
		"flexFlow"                : null,
		"flexGrow"                : null,
		"flexShrink"              : null,
		"flexWrap"                : null,
		"flowFrom"                : null,
		"flowInto"                : null,
		"fontFeatureSettings"     : null,
		"fontKerning"             : null,
		"fontSizeDelta"           : null,
		"fontSmoothing"           : null,
		"fontVariantLigatures"    : null,
		"gridAfter"               : null,
		"gridAutoColumns"         : null,
		"gridAutoFlow"            : null,
		"gridAutoRows"            : null,
		"gridBefore"              : null,
		"gridColumn"              : null,
		"gridColumns"             : null,
		"gridEnd"                 : null,
		"gridRow"                 : null,
		"gridRows"                : null,
		"gridStart"               : null,
		"highlight"               : null,
		"hyphenateCharacter"      : null,
		"hyphenateLimitAfter"     : null,
		"hyphenateLimitBefore"    : null,
		"hyphenateLimitLines"     : null,
		"hyphens"                 : null,
		"justifyContent"          : null,
		"lineAlign"               : null,
		"lineBoxContain"          : null,
		"lineBreak"               : null,
		"lineClamp"               : null,
		"lineGrid"                : null,
		"lineSnap"                : null,
		"locale"                  : null,
		"logicalHeight"           : null,
		"logicalWidth"            : null,
		"marginAfter"             : null,
		"marginAfterCollapse"     : null,
		"marginBefore"            : null,
		"marginBeforeCollapse"    : null,
		"marginBottomCollapse"    : null,
		"marginCollapse"          : null,
		"marginEnd"               : null,
		"marginStart"             : null,
		"marginTopCollapse"       : null,
		"marquee"                 : null,
		"marqueeDirection"        : null,
		"marqueeIncrement"        : null,
		"marqueeRepetition"       : null,
		"marqueeSpeed"            : null,
		"marqueeStyle"            : null,
		"mask"                    : null,
		"maskBoxImage"            : null,
		"maskBoxImageOutset"      : null,
		"maskBoxImageRepeat"      : null,
		"maskBoxImageSlice"       : null,
		"maskBoxImageSource"      : null,
		"maskBoxImageWidth"       : null,
		"maskClip"                : null,
		"maskComposite"           : null,
		"maskImage"               : null,
		"maskOrigin"              : null,
		"maskPosition"            : null,
		"maskPositionX"           : null,
		"maskPositionY"           : null,
		"maskRepeat"              : null,
		"maskRepeatX"             : null,
		"maskRepeatY"             : null,
		"maskSize"                : null,
		"maxLogicalHeight"        : null,
		"maxLogicalWidth"         : null,
		"minLogicalHeight"        : null,
		"minLogicalWidth"         : null,
		"nbspMode"                : null,
		"order"                   : null,
		"paddingAfter"            : null,
		"paddingBefore"           : null,
		"paddingEnd"              : null,
		"paddingStart"            : null,
		"perspective"             : null,
		"perspectiveOrigin"       : null,
		"perspectiveOriginX"      : null,
		"perspectiveOriginY"      : null,
		"printColorAdjust"        : null,
		"regionBreakAfter"        : null,
		"regionBreakBefore"       : null,
		"regionBreakInside"       : null,
		"regionOverflow"          : null,
		"rtlOrdering"             : null,
		"rubyPosition"            : null,
		"shapeInside"             : null,
		"shapeMargin"             : null,
		"shapeOutside"            : null,
		"shapePadding"            : null,
		"svgShadow"               : null,
		"tapHighlightColor"       : null,
		"textCombine"             : null,
		"textDecorationsInEffect" : null,
		"textEmphasis"            : null,
		"textEmphasisColor"       : null,
		"textEmphasisPosition"    : null,
		"textEmphasisStyle"       : null,
		"textFillColor"           : null,
		"textOrientation"         : null,
		"textSecurity"            : null,
		"textStroke"              : null,
		"textStrokeColor"         : null,
		"textStrokeWidth"         : null,
		"transform"               : null,
		"transformOrigin"         : null,
		"transformOriginX"        : null,
		"transformOriginY"        : null,
		"transformOriginZ"        : null,
		"transformStyle"          : null,
		"transition"              : null,
		"transitionDelay"         : null,
		"transitionDuration"      : null,
		"transitionProperty"      : null,
		"transitionTimingFunction": null,
		"userDrag"                : null,
		"userModify"              : null,
		"userSelect"              : null,
		"wrap"                    : null,
		"wrapFlow"                : null,
		"wrapThrough"             : null,
		"writingMode"             : null
	}
);


/*           Создаем заглушки для методов и свойств для поддержки ECMA5

 Например Function.prototype.bind или [].indexOf и [].sort и.т.п.
 _____________________________________________________________________________*/

/*
 Переопределим defineProperty для IE8, так как там он работает только с родными
 элементами. Если был вызван не относительно родного обьекта и выбросил исключение,
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


/*             Создаем заглушки для свойств HTML элементов
 __________________________________________________________________________*/


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


/*               Создаем заглушки для свойств обьектов событий
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


/*                  Создаем заглушки для свойств window

 В основном конечно тут ищутся вендорные аналоги, потому что мало что из
 того что содержит window можно реализовать вручную, по этому в большенстве
 случаев за место альтернативной реализаций передаем null
 __________________________________________________________________________*/

var propertyWindow = new CapsList('window', {

	'AnimationEvent'             : null,
	'CSSFilterRule'              : null,
	'CSSFilterValue'             : null,
	'CSSKeyframeRule'            : null,
	'CSSKeyframesRule'           : null,
	'CSSMatrix'                  : null,
	'CSSMixFunctionValue'        : null,
	'CSSRegionRule'              : null,
	'CSSTransformValue'          : null,
	'IDBCursor'                  : null,
	'IDBDatabase'                : null,
	'IDBFactory'                 : null,
	'IDBIndex'                   : null,
	'IDBKeyRange'                : null,
	'IDBObjectStore'             : null,
	'IDBRequest'                 : null,
	'IDBTransaction'             : null,
	'MediaSource'                : null,
	'MutationObserver'           : null,
	'Point'                      : null,
	'RTCPeerConnection'          : null,
	'ShadowRoot'                 : null,
	'SourceBuffer'               : null,
	'SourceBufferList'           : null,
	'TransitionEvent'            : null,
	'URL'                        : null,
	'Worker'                     : null,
	'audioContext'               : null,
	'audioPannerNode'            : null,
	'cancelAnimationFrame'       : null,
	'cancelRequestAnimationFrame': function (intervalId) {
		return clearTimeout(intervalId)
	},
	'convertPointFromNodeToPage' : null,
	'convertPointFromPageToNode' : null,
	'indexedDB'                  : null,
	'mediaStream'                : null,
	'notifications'              : null,
	'offlineAudioContext'        : null,
	'requestAnimationFrame'      : function (callback) {
		return setTimeout(callback, 1000 / 60)
	},
	'requestFileSystem'          : null,
	'resolveLocalFileSystemURL'  : null,
	'speechGrammar'              : null,
	'speechGrammarList'          : null,
	'speechRecognition'          : null,
	'speechRecognitionError'     : null,
	'speechRecognitionEvent'     : null
});


/*                         В этом файле все собираем
 __________________________________________________________________________*/

var fix = new Fix;
var notification = new Notification;

Fix.onoldbrowserdetected = function (key) {
	notification.addMessage(key);
};


CapsList.addEventListener(function (key) {
	notification.addMessage(key);
});


fix.addPropertyCaps(propertyWindow);
fix.addPropertyCaps(propertyArray);
fix.addPropertyCaps(propertyFunction);
fix.addPropertyCaps(propertyElement);


fix.addProxyCaps(proxyCss);
fix.addProxyCaps(proxyEvent);
fix.addProxyCaps(proxyElement);
fix.addProxyCaps(proxyDocument);


fix.override(overrideElement);
if (/MSIE 8/.test(navigator.userAgent)) {
	fix.override(objectDefineProperty);
}