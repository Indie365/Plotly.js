'use strict';

var d3 = require('../../lib/d3');
var getTraceFromCd = require('../../lib/trace_from_cd');
var Color = require('../../components/color');
var Drawing = require('../../components/drawing');

function style(gd, cd, sel) {
    var s = sel ? sel : d3.select(gd).selectAll('g.trace.boxes');

    s.style('opacity', function(d) { return getTraceFromCd(d).opacity; });

    s.each(function(d) {
        var el = d3.select(this);
        var trace = getTraceFromCd(d);
        var lineWidth = trace.line.width;

        function styleBox(boxSel, lineWidth, lineColor, fillColor) {
            boxSel.style('stroke-width', lineWidth + 'px')
                .call(Color.stroke, lineColor)
                .call(Color.fill, fillColor);
        }

        var allBoxes = el.selectAll('path.box');

        if(trace.type === 'candlestick') {
            allBoxes.each(function(boxData) {
                if(boxData.empty) return;

                var thisBox = d3.select(this);
                var container = trace[boxData.dir]; // dir = 'increasing' or 'decreasing'
                styleBox(thisBox, container.line.width, container.line.color, container.fillcolor);
                // TODO: custom selection style for candlesticks
                thisBox.style('opacity', trace.selectedpoints && !boxData.selected ? 0.3 : 1);
            });
        } else {
            styleBox(allBoxes, lineWidth, trace.line.color, trace.fillcolor);
            el.selectAll('path.mean')
                .styles({
                    'stroke-width': lineWidth,
                    'stroke-dasharray': (2 * lineWidth) + 'px,' + lineWidth + 'px'
                })
                .call(Color.stroke, trace.line.color);

            var pts = el.selectAll('path.point');
            Drawing.pointStyle(pts, trace, gd);
        }
    });
}

function styleOnSelect(gd, cd, sel) {
    var trace = getTraceFromCd(cd);
    var pts = sel.selectAll('path.point');

    if(trace.selectedpoints) {
        Drawing.selectedPointStyle(pts, trace);
    } else {
        Drawing.pointStyle(pts, trace, gd);
    }
}

module.exports = {
    style: style,
    styleOnSelect: styleOnSelect
};
