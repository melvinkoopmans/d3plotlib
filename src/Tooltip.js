"use strict";
exports.__esModule = true;
var d3 = require("d3");
var Tooltip = /** @class */ (function () {
    function Tooltip(selector, formatter) {
        this.selector = selector;
        this.tooltip = d3.select(selector).append('div')
            .style('opacity', 0)
            .style('position', 'absolute')
            .attr('class', 'tooltip')
            .style('background', '#FFF')
            .style('padding', '5px');
        this.formatter = formatter;
    }
    Tooltip.prototype.getLeaveHandler = function () {
        var tooltip = this.tooltip;
        return function (d) {
            tooltip.style('opacity', 0);
        };
    };
    Tooltip.prototype.getOverHandler = function () {
        var tooltip = this.tooltip;
        return function (d) {
            tooltip.style('opacity', 1);
        };
    };
    Tooltip.prototype.getMoveHandler = function (defaultFormatter) {
        var _a = this, tooltip = _a.tooltip, selector = _a.selector;
        var formatter = this.formatter || defaultFormatter;
        return function (d) {
            var bounds = document.querySelector(selector).getBoundingClientRect();
            var x = d3.event.pageX - bounds.x;
            var y = d3.event.pageY - bounds.y;
            tooltip
                .html(formatter(d))
                .style('left', x + 20 + "px")
                .style('top', y - 20 + "px");
        };
    };
    return Tooltip;
}());
exports["default"] = Tooltip;
