"use strict";
exports.__esModule = true;
var d3 = require("d3");
var Tooltip_1 = require("./Tooltip");
var BaseChart = /** @class */ (function () {
    function BaseChart(selector, width, height) {
        this.config = {
            yLabel: null,
            xLabel: null,
            xTicks: 5,
            yTicks: 5,
            colors: [],
            margin: {
                top: 10,
                right: 30,
                bottom: 20,
                left: 60
            },
            tooltip: null
        };
        this.isAutoAdjusted = false;
        this.selector = selector;
        this.width = width;
        this.height = height;
        this.svg = this.buildSvg();
    }
    BaseChart.prototype.colors = function (colors) {
        this.config.colors = colors;
        return this;
    };
    BaseChart.prototype.yLabel = function (label) {
        this.config.yLabel = label;
        return this;
    };
    BaseChart.prototype.xLabel = function (label) {
        this.config.xLabel = label;
        return this;
    };
    BaseChart.prototype.xTicks = function (ticks) {
        this.config.xTicks = ticks;
        return this;
    };
    BaseChart.prototype.yTicks = function (ticks) {
        this.config.yTicks = ticks;
        return this;
    };
    BaseChart.prototype.tooltip = function (formatter) {
        if (formatter === void 0) { formatter = null; }
        this.config.tooltip = new Tooltip_1["default"](this.selector, formatter);
        return this;
    };
    BaseChart.prototype.buildSvg = function () {
        var _a = this.config, margin = _a.margin, yLabel = _a.yLabel, xLabel = _a.xLabel;
        var _b = this, selector = _b.selector, width = _b.width, height = _b.height;
        d3.select(selector).select('svg').remove();
        if (xLabel) {
            this.config.margin.bottom += 17;
        }
        var svg = d3.select(selector)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        this.defs = svg.append('defs');
        var svgG = svg.append('g')
            .attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
        if (yLabel) {
            svgG.append('text')
                .text(yLabel)
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - (height / 2))
                .attr('dy', '12px')
                .attr('font-size', '12px')
                .style('text-anchor', 'middle');
        }
        if (xLabel) {
            svgG.append('text')
                .text(xLabel)
                .attr('y', this.height + 17)
                .attr('x', width / 2)
                .attr('dy', '12px')
                .attr('font-size', '12px')
                .style('text-anchor', 'middle');
        }
        return svgG;
    };
    BaseChart.prototype.getTooltip = function () {
        return this.config.tooltip;
    };
    BaseChart.prototype.autoAdjust = function (yAxis, side) {
        if (side === void 0) { side = 'left'; }
        var _a = this.config, margin = _a.margin, yLabel = _a.yLabel;
        var yLabelsMaxWidth = parseInt(d3.max(yAxis.selectAll('g').nodes()
            .map(function (node) { return node.getBoundingClientRect().width; })));
        var indent = yLabelsMaxWidth - (side === 'left' ? margin.left : margin.right) + (yLabel ? 20 : 0);
        this.width -= indent;
        if (side === 'left') {
            this.config.margin.left += indent;
        }
        else {
            this.config.margin.right += indent;
        }
        this.isAutoAdjusted = true;
        this.svg = this.buildSvg();
    };
    BaseChart.prototype.addHorizontalGridlines = function (yScale) {
        var g = this.svg.select('.grid');
        var yAxis = d3.axisLeft(yScale);
        if (g.nodes().length === 0) {
            g = this.svg.append('g')
                .attr('class', 'grid')
                .call(yAxis.tickSize(-this.width).tickFormat(function () { return ''; }));
        }
        g.selectAll('line')
            .attr('transform', 'translate(1, 0)')
            .attr('stroke', '#DDD')
            .attr('stroke-dasharray', '2,2');
        g.selectAll('.tick:first-of-type line').remove();
        g.selectAll('path').remove();
    };
    BaseChart.prototype.addVerticalGridlines = function (xScale) {
        var xAxis = d3.axisBottom(xScale);
        var g = this.svg.append('g')
            .attr('class', 'grid')
            .call(xAxis.tickSize(this.height).tickFormat(function () { return ''; }));
        g.selectAll('line')
            .attr('x', function (d) { return xScale(d); })
            .attr('stroke', '#DDD')
            .attr('stroke-dasharray', '2,2');
        g.selectAll('.tick:first-of-type').remove();
        g.selectAll('path').remove();
    };
    BaseChart.prototype.getColorScheme = function (domain) {
        return d3.scaleOrdinal()
            .domain(domain)
            .range(this.config.colors);
    };
    return BaseChart;
}());
exports["default"] = BaseChart;
