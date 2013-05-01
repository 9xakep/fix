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