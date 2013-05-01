/********************************************************************************************************
 *                               Создаем заглушки для свойств window                                    *
 *                                                                                                      *
 *                В основном конечно тут ищутся вендорные аналоги, потому что мало что из               *
 *              того что содержит window можно реализовать вручную, по этому в большенстве              *
 *                     случаев за место альтернативной реализаций передаем null                         *
 *                                                                                                      *
 *                                                                                                     *
 *******************************************************************************************************/


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