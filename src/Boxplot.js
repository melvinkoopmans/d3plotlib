"use strict";
exports.__esModule = true;
var d3 = require("d3");
var Boxplot = /** @class */ (function () {
    function Boxplot(selector, width, height) {
        this.selector = selector;
        this.width = width;
        this.height = height;
        this.svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }
    Boxplot.prototype.plot = function (data, variables) {
    };
    return Boxplot;
}());
exports["default"] = Boxplot;
