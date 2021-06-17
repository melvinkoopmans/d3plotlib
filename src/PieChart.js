"use strict";
exports.__esModule = true;
var d3 = require("d3");
var PieChart = /** @class */ (function () {
    function PieChart(selector, width, height) {
        this.selector = selector;
        this.width = width;
        this.height = height;
        this.svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }
    PieChart.prototype.plot = function (data, category, value) {
        var _this = this;
        var _a = this, width = _a.width, height = _a.height;
        var pie = d3.pie()
            .value(function (d) { return d[value]; })
            .sort(null)
            .padAngle(0.02)
            .startAngle(0)
            .endAngle(2 * Math.PI)(data);
        var arc = d3.arc().innerRadius(0).outerRadius(width / 2).cornerRadius(0);
        var color = d3.scaleOrdinal(d3.schemeTableau10)
            .domain(pie.map(function (d) { return d.index; }));
        var g = this.svg
            .append('g').attr('transform', "translate(" + width / 2 + ", " + height / 2 + ")");
        g.selectAll('path').data(pie).enter().append('path')
            .attr('fill', function (d) { return color(d.index); })
            .attr('stroke', '#DDD')
            .transition().duration(1300).ease(d3.easeCubicInOut)
            .attrTween('d', function (d) {
            var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) {
                return arc(i(t));
            };
        });
        g.selectAll('text').data(pie).enter().append('text')
            .text(function (d) { return d.data[category]; })
            .attr('x', function (d) { return arc.innerRadius(_this.width / 5).centroid(d)[0]; })
            .attr('y', function (d) { return arc.innerRadius(_this.width / 5).centroid(d)[1]; })
            .attr('font-size', 14)
            .attr('text-anchor', 'middle');
    };
    return PieChart;
}());
exports["default"] = PieChart;
