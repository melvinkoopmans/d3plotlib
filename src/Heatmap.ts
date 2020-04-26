import * as d3 from 'd3';
import Baseplot from './Baseplot';

class Heatmap extends Baseplot {
    heatmapConfig: {
        ticksEvery: number | null,
    } = {
        ticksEvery: null
    }

    constructor(selector: string, width: number, height: number) {
        super(selector, width, height);
        this.config.margin.left = 0
        this.svg = this.buildSvg();
    }

    plot(data: any, x: number[], y: string) {
        const { ticksEvery } = this.heatmapConfig;
        const { tooltip } = this.config;

        const xScale = d3.scaleBand<number>()
            .domain(x)
            .range([0, this.width])
            .padding(0.01)

        const xAxis = d3.axisBottom(xScale);

        if (ticksEvery) {
            xAxis.tickValues(xScale.domain().filter((d, i) => {
                return i > 0 && d % ticksEvery === 0;
            }))
        }

        const xAxisGroup = this.svg.append('g')
            .attr('transform', `translate(0, ${this.height - 2})`)
            .call(xAxis);

        xAxisGroup.selectAll('path').remove();
        xAxisGroup.selectAll('.tick line').remove();

        const yScale = d3.scaleBand<string>()
            .domain(data.map((d: any) => d[y]))
            .range([0, this.height]);

        const yAxis = this.svg.append('g')
            .attr('transform', `translate(${this.width - 5}, 0)`)
            .call(d3.axisRight(yScale));

        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis, 'right');
            this.plot(data, x, y);
            return;
        }

        yAxis.selectAll('path').remove();
        yAxis.selectAll('.tick line').remove();

        const color = d3.scaleLinear<string, number>()
            .range(['#006460', '#A1EFEC'])
            .domain([0, 100]);

        const tiles = this.svg.append('g')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .selectAll('rect')
            .data((d: any) => x.map((key) => ({ key, group: d[y], value: d[key] || 0 })))
            .enter().append('rect')
                .attr('x', (d: any) => xScale(d.key)!)
                .attr('y', (d: any) => yScale(d.group)!)
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', '#000');

        if (tooltip) {
            tiles
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler())
                .on('mousemove', tooltip.getMoveHandler()); 
        }

        tiles.transition()
            .ease(d3.easeSinInOut)
            .delay((d, i) => i * (1000 / x.length))
            .duration(1000)
            .attr('fill', (d: any) => color(d.value));
    }

    ticksEvery(amount: number): Heatmap {
        this.heatmapConfig.ticksEvery = amount;
        return this;
    }
}

export default Heatmap;