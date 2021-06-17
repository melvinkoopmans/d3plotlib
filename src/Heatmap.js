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
var ColorBox_1 = require("./ColorBox");
var Heatmap = /** @class */ (function (_super) {
    __extends(Heatmap, _super);
    function Heatmap(selector, width, height) {
        var _this = _super.call(this, selector, width, height) || this;
        _this.heatmapConfig = {
            ticksEvery: null
        };
        _this.config.margin.left = 0;
        _this.config.margin.top = 55;
        _this.svg = _this.buildSvg();
        return _this;
    }
    Heatmap.prototype.plot = function (data, x, y) {
        var ticksEvery = this.heatmapConfig.ticksEvery;
        var tooltip = this.config.tooltip;
        var xScale = d3.scaleBand()
            .domain(x)
            .range([0, this.width])
            .padding(0.01);
        var xAxis = d3.axisBottom(xScale);
        if (ticksEvery) {
            xAxis.tickValues(xScale.domain().filter(function (d, i) {
                return i > 0 && d % ticksEvery === 0;
            }));
        }
        var xAxisGroup = this.svg.append('g')
            .attr('transform', "translate(0, " + (this.height - 2) + ")")
            .call(xAxis);
        xAxisGroup.selectAll('path').remove();
        xAxisGroup.selectAll('.tick line').remove();
        var yScale = d3.scaleBand()
            .domain(data.map(function (d) { return d[y]; }))
            .range([0, this.height]);
        var yAxis = this.svg.append('g')
            .attr('transform', "translate(" + (this.width - 5) + ", 0)")
            .call(d3.axisRight(yScale));
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis, 'right');
            this.plot(data, x, y);
            return;
        }
        yAxis.selectAll('path').remove();
        yAxis.selectAll('.tick line').remove();
        var color = d3.scaleLinear()
            .range(['#006460', '#A1EFEC'])
            .domain([0, 100]);
        var colorbox = d3.select(this.selector).select('svg').append('g').attr('transform', 'translate(2, 0)');
        new ColorBox_1["default"]([this.width / 2, 30], color, true).create(colorbox);
        var tiles = this.svg.append('g')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .selectAll('rect')
            .data(function (d) { return x.map(function (key) { return ({ key: key, group: d[y], value: d[key] || 0 }); }); })
            .enter().append('rect')
            .attr('x', function (d) { return xScale(d.key); })
            .attr('y', function (d) { return yScale(d.group); })
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', '#000')
            .on('mouseover', function (d) {
            if (tooltip) {
                tooltip.getOverHandler().bind(this)(d);
            }
            d3.select(this).attr('stroke', '#000');
        })
            .on('mouseleave', function (d) {
            if (tooltip) {
                tooltip.getLeaveHandler().bind(this)(d);
            }
            d3.select(this).attr('stroke', null);
        });
        if (tooltip) {
            tiles.on('mousemove', tooltip.getMoveHandler(function (d) { return d.value; }));
        }
        tiles.transition()
            .ease(d3.easeSinInOut)
            .delay(function (d, i) { return i * (1000 / x.length); })
            .duration(1000)
            .attr('fill', function (d) { return color(d.value); });
    };
    Heatmap.prototype.ticksEvery = function (amount) {
        this.heatmapConfig.ticksEvery = amount;
        return this;
    };
    return Heatmap;
}(BaseChart_1["default"]));
exports["default"] = Heatmap;
