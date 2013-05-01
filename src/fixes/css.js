/*		       Создаем заглушки для element.style
 __________________________________________________________________________*/

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