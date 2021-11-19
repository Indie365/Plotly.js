'use strict';

var Lib = require('../../lib');

var handleSampleDefaults = require('./sample_defaults');
var handleStyleDefaults = require('../heatmap/style_defaults');
var colorscaleDefaults = require('../../components/colorscale/defaults');
var attributes = require('./attributes');


module.exports = function supplyDefaults(traceIn, traceOut, defaultColor, layout) {
    function coerce(attr, dflt) {
        return Lib.coerce(traceIn, traceOut, attributes, attr, dflt);
    }

    handleSampleDefaults(traceIn, traceOut, coerce, layout);
    if(traceOut.visible === false) return;

    handleStyleDefaults(traceIn, traceOut, coerce, layout);
    colorscaleDefaults(traceIn, traceOut, layout, coerce, {prefix: '', cLetter: 'z'});
    coerce('hovertemplate');
    coerce('texttemplate');

    var fontDflt = Lib.extendFlat({}, layout.font);
    fontDflt.color = undefined; // color contrast by default
    Lib.coerceFont(coerce, 'textfont', fontDflt);

    coerce('xhoverformat');
    coerce('yhoverformat');
};
