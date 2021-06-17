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
var Barplot = /** @class */ (function (_super) {
    __extends(Barplot, _super);
    function Barplot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.barplotConfig = {
            isHorizontal: false,
            xAccessor: 'x',
            yAccessor: 'y',
            animated: false
        };
        return _this;
    }
    Barplot.prototype.plot = function (data, x, y) {
        var height = this.height;
        var tooltip = this.config.tooltip;
        var _a = this.barplotConfig, yAccessor = _a.yAccessor, isHorizontal = _a.isHorizontal, animated = _a.animated;
        this.barplotConfig.xAccessor = isHorizontal ? x : x;
        this.barplotConfig.yAccessor = isHorizontal ? y : y;
        var _b = this.getYAxis(data), yAxis = _b.yAxis, yScale = _b.yScale;
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, x, y);
            return;
        }
        yAxis.selectAll('.tick line').remove();
        if (!isHorizontal) {
            this.addHorizontalGridlines(yScale);
            yAxis.selectAll('path').remove();
        }
        else {
            yAxis.selectAll('path').attr('stroke', '#DDD');
        }
        var xScale = this.getXAxis(data).xScale;
        if (isHorizontal) {
            this.addVerticalGridlines(xScale);
        }
        var color = this.getColorScheme(xScale);
        var bars;
        var domainLength = xScale.domain().length;
        if (isHorizontal) {
            bars = this.svg.selectAll('rect').data(data).enter()
                .append('rect')
                .attr('x', 1)
                .attr('y', function (d) { return yScale(d[x]); })
                .attr('height', yScale.bandwidth())
                .attr('width', 0)
                .attr('fill', function (d) { return color(d[x]); });
            if (animated) {
                bars.transition()
                    .ease(d3.easeElastic).delay(function (d, i) { return i * (700 / domainLength); }).duration(1250)
                    .attr('width', function (d) { return xScale(d[y]) - 1; });
            }
            else {
                bars.attr('width', function (d) { return xScale(d[y]) - 1; });
            }
        }
        else {
            bars = this.svg.selectAll('rect').data(data).enter()
                .append('rect')
                .attr('x', function (d) { return xScale(d[x]); })
                .attr('y', height)
                .attr('width', xScale.bandwidth())
                .attr('height', 0)
                .attr('fill', function (d) { return color(d[x]); });
            if (animated) {
                bars.transition()
                    .ease(d3.easeElastic).delay(function (d, i) { return i * (700 / domainLength); }).duration(1250)
                    .attr('y', function (d) { return yScale(d[y]); })
                    .attr('height', function (d) { return height - yScale(d[y]); });
            }
            else {
                bars
                    .attr('y', function (d) { return yScale(d[y]); })
                    .attr('height', function (d) { return height - yScale(d[y]); });
            }
        }
        if (tooltip) {
            bars
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler())
                .on('mousemove', tooltip.getMoveHandler(function (d) { return d[yAccessor]; }));
        }
    };
    Barplot.prototype.horizontal = function () {
        this.barplotConfig.isHorizontal = true;
        return this;
    };
    Barplot.prototype.animate = function () {
        this.barplotConfig.animated = true;
        return this;
    };
    Barplot.prototype.getXAxis = function (data) {
        var _a = this.barplotConfig, isHorizontal = _a.isHorizontal, xAccessor = _a.xAccessor, yAccessor = _a.yAccessor;
        var xScale;
        if (isHorizontal) {
            xScale = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return 1.1 * d[yAccessor]; })])
                .range([0, this.width]);
        }
        else {
            xScale = d3.scaleBand()
                .range([0, this.width])
                .domain(data.map(function (d) { return d[xAccessor]; }))
                .padding(0.2);
        }
        var xAxis = this.svg.append("g")
            .attr("transform", "translate(0, " + this.height + ")")
            .call(d3.axisBottom(xScale));
        if (isHorizontal) {
            xAxis.selectAll('path').remove();
        }
        else {
            xAxis.selectAll('path').attr('stroke', '#DDD');
        }
        xAxis.selectAll('.tick line').remove();
        xAxis.selectAll('.tick text').attr('transform', 'translate(0, -3)');
        return { xAxis: xAxis, xScale: xScale };
    };
    Barplot.prototype.getYAxis = function (data) {
        var _a = this.barplotConfig, isHorizontal = _a.isHorizontal, xAccessor = _a.xAccessor, yAccessor = _a.yAccessor;
        var yScale;
        if (isHorizontal) {
            yScale = d3.scaleBand()
                .range([0, this.height])
                .domain(data.map(function (d) { return d[xAccessor]; }))
                .padding(0.2);
        }
        else {
            yScale = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return 1.1 * d[yAccessor]; })])
                .range([this.height, 0]);
        }
        var yAxis = this.svg.append('g')
            .call(d3.axisLeft(yScale));
        return { yAxis: yAxis, yScale: yScale };
    };
    return Barplot;
}(BaseChart_1["default"]));
exports["default"] = Barplot;
