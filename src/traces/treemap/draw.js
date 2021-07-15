'use strict';

var Lib = require('../../lib');
var d3 = require('../../lib/d3');
var getTraceFromCd = require('../../lib/trace_from_cd');
var helpers = require('../sunburst/helpers');
var uniformText = require('../bar/uniform_text');
var clearMinTextSize = uniformText.clearMinTextSize;
var resizeText = require('../bar/style').resizeText;

var plotOne = require('./plot_one');

module.exports = function _plot(gd, cdmodule, transitionOpts, makeOnCompleteCallback, opts) {
    var d3EaseFn = Lib.whichD3EaseFn(transitionOpts);
    var type = opts.type;
    var drawDescendants = opts.drawDescendants;

    var fullLayout = gd._fullLayout;
    var layer = fullLayout['_' + type + 'layer'];
    var join, onComplete;

    // If transition config is provided, then it is only a partial replot and traces not
    // updated are removed.
    var isFullReplot = !transitionOpts;

    clearMinTextSize(type, fullLayout);

    join = layer.selectAll('g.trace.' + type)
        .data(cdmodule, function(cd) { return getTraceFromCd(cd).uid; })
        .enter()
        .append('g');

    join
        .classed('trace', true)
        .classed(type, true);

    join.order();

    if(!fullLayout.uniformtext.mode && helpers.hasTransition(transitionOpts)) {
        if(makeOnCompleteCallback) {
            // If it was passed a callback to register completion, make a callback. If
            // this is created, then it must be executed on completion, otherwise the
            // pos-transition redraw will not execute:
            onComplete = makeOnCompleteCallback();
        }

        var transition = d3.transition()
            .duration(transitionOpts.duration)
            .ease(d3EaseFn)
            .each('end', function() { onComplete && onComplete(); })
            .each('interrupt', function() { onComplete && onComplete(); });

        transition.each(function() {
            // Must run the selection again since otherwise enters/updates get grouped together
            // and these get executed out of order. Except we need them in order!
            layer.selectAll('g.trace').each(function(cd) {
                plotOne(gd, cd, this, transitionOpts, drawDescendants);
            });
        });
    } else {
        join.each(function(cd) {
            plotOne(gd, cd, this, transitionOpts, drawDescendants);
        });

        if(fullLayout.uniformtext.mode) {
            resizeText(gd, layer.selectAll('.trace'), type);
        }
    }

    if(isFullReplot) {
        join.exit().remove();
    }
};
