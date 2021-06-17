"use strict";
exports.__esModule = true;
var d3 = require("d3");
var ColorBox = /** @class */ (function () {
    function ColorBox(size, colors, ticks) {
        if (ticks === void 0) { ticks = false; }
        this.isVertical = false;
        this.size = size;
        this.colors = colors;
        this.ticks = ticks;
    }
    ColorBox.prototype.create = function (sel) {
        var _a = this, size = _a.size, colors = _a.colors, ticks = _a.ticks, isVertical = _a.isVertical;
        var _b = d3.extent(colors.domain()), x0 = _b[0], x1 = _b[1];
        var bars = d3.range(x0, x1, (x1 - x0) / size[0]);
        var sc = d3.scaleLinear()
            .domain([x0, x1]).range([0, size[0]]);
        var lines = sel.selectAll('line').data(bars).enter()
            .append('line')
            .attr('stroke', colors);
        var container = sel.append('rect')
            .attr('fill', 'none').attr('stroke', 'black');
        if (isVertical) {
            lines
                .attr('x1', 0).attr('x2', size[1])
                .attr('y1', sc).attr('y2', sc);
            container.attr('width', size[1]).attr('height', size[0]);
        }
        else {
            lines
                .attr('x1', sc).attr('x2', sc)
                .attr('y1', 0).attr('y2', size[1]);
            container.attr('width', size[0]).attr('height', size[1]);
        }
        if (ticks) {
            var tScale = d3.scaleLinear().domain(colors.domain()).range([0, size[0]]);
            sel.append('g')
                .call(isVertical ? d3.axisRight(tScale) : d3.axisBottom(tScale))
                .attr('transform', isVertical ? "translate(" + size[1] + ", 0)" : "translate(0, " + size[1] + ")");
        }
    };
    ColorBox.prototype.vertical = function () {
        this.isVertical = true;
        return this;
    };
    return ColorBox;
}());
exports["default"] = ColorBox;
