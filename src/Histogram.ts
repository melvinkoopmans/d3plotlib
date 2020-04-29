import * as d3 from 'd3';
import BaseChart from './BaseChart';

class Histogram extends BaseChart {
    private histogramConfig: {
        bins: number,
    } = {
        bins: 30,
    }

    plot(data: any, xAccessor: string) {
        const { width, height } = this;
        const { tooltip } = this.config;
        const { bins } = this.histogramConfig;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d: any) => parseInt(d[xAccessor]))!])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([0, width]);

        const xAxis = this.svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));
            
        const histogram = d3.histogram()
            .value((d: any) => d[xAccessor])
            .domain(xScale.domain() as [number, number])
            .thresholds(xScale.ticks(bins));

        const histogramBins = histogram(data);

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(histogramBins, (d: d3.Bin<number, number>) => d.length)!]);

        const yAxis = this.svg.append('g')
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

        this.addHorizontalGridlines(yScale as any);

        const colors = this.getColorScheme(xScale.domain());

        const bars = this.svg.selectAll('rect')
            .data(histogramBins)
            .enter()
            .append('rect')
                .attr('x', 1)
                .attr('y', (d: d3.Bin<number, number>) => height - yScale(d.length))
                .attr('transform', (d: d3.Bin<number, number>) => `translate(${xScale(d.x0!)}, ${yScale(d.length)})`)
                .attr('width', (d: d3.Bin<number, number>) => xScale(d.x1!) - xScale(d.x0!) - 1)
                .attr('height', 0)
                .style('fill', (d: d3.Bin<number, number>) => colors(d.x0!));
            
        if (tooltip) {
            bars
                .on('mousemove', tooltip.getMoveHandler((d: d3.Bin<number, number>) => `${d.length}`))
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler());
        }
            
        bars.transition()
            .ease(d3.easeElastic).delay((d, i) => i * (700 / bins)).duration(1000)
            .attr('height', (d: d3.Bin<number, number>) => height - yScale(d.length))
            .attr('y', 0);
    }

    bins(amount: number): Histogram {
        this.histogramConfig.bins = amount;
        return this;
    }
}

export default Histogram;
