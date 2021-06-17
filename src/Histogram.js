"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var d3 = require("d3");
var BaseChart_1 = require("./BaseChart");
var Histogram = /** @class */ (function (_super) {
    __extends(Histogram, _super);
    function Histogram() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.histogramConfig = {
            bins: 30
        };
        return _this;
    }
    Histogram.prototype.plot = function (data, xAccessor) {
        var _a = this, width = _a.width, height = _a.height;
        var tooltip = this.config.tooltip;
        var bins = this.histogramConfig.bins;
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return parseInt(d[xAccessor]); })]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([0, width]);
        var xAxis = this.svg.append('g')
            .attr('transform', "translate(0, " + height + ")")
            .call(d3.axisBottom(xScale));
        var histogram = d3.histogram()
            .value(function (d) { return d[xAccessor]; })
            .domain(xScale.domain())
            .thresholds(xScale.ticks(bins));
        var histogramBins = histogram(data);
        var yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(histogramBins, function (d) { return d.length; })]);
        var yAxis = this.svg.append('g')
            .call(d3.axisLeft(yScale));
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, xAccessor);
            return;
        }
        yAxis.selectAll('path').attr('stroke', '#DDD');
        yAxis.selectAll('.tick line').remove();
        xAxis.selectAll('path').attr('stroke', '#DDD');
        xAxis.selectAll('.tick line').remove();
        xAxis.selectAll('.tick text').attr('transform', 'translate(0, -3)');
        this.addHorizontalGridlines(yScale);
        var colors = this.getColorScheme(xScale.domain());
        var bars = this.svg.selectAll('rect')
            .data(histogramBins)
            .enter()
            .append('rect')
            .attr('x', 1)
            .attr('y', function (d) { return height - yScale(d.length); })
            .attr('transform', function (d) { return "translate(" + xScale(d.x0) + ", " + yScale(d.length) + ")"; })
            .attr('width', function (d) { return xScale(d.x1) - xScale(d.x0) - 1; })
            .attr('height', 0)
            .style('fill', function (d) { return colors(d.x0); });
        if (tooltip) {
            bars
                .on('mousemove', tooltip.getMoveHandler(function (d) { return "" + d.length; }))
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler());
        }
        bars.transition()
            .ease(d3.easeElastic).delay(function (d, i) { return i * (700 / bins); }).duration(1000)
            .attr('height', function (d) { return height - yScale(d.length); })
            .attr('y', 0);
    };
    Histogram.prototype.bins = function (amount) {
        this.histogramConfig.bins = amount;
        return this;
    };
    return Histogram;
}(BaseChart_1["default"]));
exports["default"] = Histogram;
