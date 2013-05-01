/*******************************************************************************************************
 *                                         Класс Notification                                          *
 *                                                                                                     *
 *                Класс создает вверху страницы окно уведомленя о том что браузер устарел,             *
 *             какие свойства не поддерживаются, ссылки на скачку нормальных браузеров и.т.п.          *
 *                                                                                                     *
 *                                                                                                     *
 *******************************************************************************************************/


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