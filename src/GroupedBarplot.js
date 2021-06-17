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
var GroupedBarplot = /** @class */ (function (_super) {
    __extends(GroupedBarplot, _super);
    function GroupedBarplot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupedBarplot.prototype.plot = function (data, groupBy, subgroups) {
        var _this = this;
        var tooltip = this.config.tooltip;
        var groups = d3.map(data, function (d) { return d[groupBy]; }).keys();
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d3.max(subgroups, function (s) {
                    return d[s];
                });
            })])
            .range([this.height, 0]);
        this.addHorizontalGridlines(yScale);
        var yAxis = this.svg.append('g')
            .attr('transform', 'translate(5, 0)')
            .call(d3.axisLeft(yScale));
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, groupBy, subgroups);
            return;
        }
        yAxis.selectAll('path').remove();
        yAxis.selectAll('line').remove();
        var xScale = d3.scaleBand()
            .domain(groups)
            .range([0, this.width])
            .padding(0.2);
        var xAxis = this.svg.append('g')
            .attr('transform', "translate(0, " + this.height + ")")
            .call(d3.axisBottom(xScale).tickSize(0));
        xAxis.selectAll('path').attr('stroke', '#DDD');
        xAxis.selectAll('.tick text').attr('transform', 'translate(0, 2)');
        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, xScale.bandwidth()])
            .padding(0);
        var color = this.getColorScheme(subgroups);
        var bars = this.svg.append('g')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function (d) { return "translate(" + xScale(d[groupBy]) + ", 0)"; })
            .selectAll('rect')
            .data(function (d) { return subgroups.map(function (key) { return ({ key: key, value: d[key] }); }); })
            .enter().append('rect')
            .attr('x', function (d) { return xSubgroup(d.key); })
            .attr('y', this.height)
            .attr('width', xSubgroup.bandwidth())
            .attr('height', 0)
            .attr('fill', function (d) { return color(d.key); });
        bars.transition().ease(d3.easeElastic).duration(1250)
            .attr('y', function (d) { return yScale(d.value); })
            .attr('height', function (d) { return _this.height - yScale(d.value); });
        if (tooltip) {
            bars
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler())
                .on('mousemove', tooltip.getMoveHandler(function (d) { return d.value; }));
        }
    };
    return GroupedBarplot;
}(BaseChart_1["default"]));
exports["default"] = GroupedBarplot;
