import * as d3 from 'd3';
import BaseChart from './BaseChart';

type Kernel = ((x:number) => number);
type KernelFactory = (bandwidth: number) => Kernel;

class KDE extends BaseChart {
    private kdeConfig: {
        bandwidth: number,
    } = {
        bandwidth: 1.0
    };

    plot(data: any, x: string) {
        const { width, height } = this;
        const { bandwidth } = this.kdeConfig;
        const bins = 15;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, (d: any) => parseInt(d[x])) as [number, number]).nice()
            .range([0, width]);

        const thresholds = xScale.ticks(50);

        const epanechnikov: KernelFactory = (bandwidth: number) => {
            return (x: number) => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
        }

        const kde = (kernel: Kernel, thresholds: number[], data: any) => {
            return thresholds.map((t) => [t, d3.mean(data, (d: any) => kernel(t - d[x]))]);
        }

        let kernel = kde(epanechnikov(1), thresholds, data);

        const kernelTotal = d3.sum(kernel, (d) => d[1]);
        kernel = kernel.map((d) => [d[0], d[1]! / kernelTotal]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(kernel, (d: any) => d[1])])
            .range([height, 0]);

        const xAxis = this.svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        const yAxis = this.svg.append('g')
            .call(d3.axisLeft(yScale));

        
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, x);
            return;
        }

        this.addHorizontalGridlines(yScale as any);

        const path = this.svg.append('g').append('path')
            .attr('d', d3.line().curve(d3.curveBasis).x((d: any) => xScale(d[0])).y((d: any) => yScale(d[1]))(kernel))
            .attr('fill', 'none').attr('stroke', '#03A49E');

        const area = d3.area()
            .curve(d3.curveBasis)
            .x0((d) => xScale(d[0]))
            .y0(height)
            .y1((d) => yScale(d[1]));

        const defs = d3.select(this.selector).select('svg').append('defs');

        const maskId = `auc-clip-${this.selector.replace('#', '')}`;
        const mask = defs.append('clipPath')
            .attr('id', maskId)
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#000');

        this.svg.append('path')
            .data([kernel])
            .attr('class', 'area')
            .attr('clip-path', `url(#${maskId})`)
            .attr('d', area as any)
            .attr('fill', '#03A49E')
            .attr('opacity', 0.3);

        const text = this.svg.append('text')
            .style('opacity', 0)
            .style('color', '#000')

        const container = this.svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('mouseenter', function() {
                text.transition().duration(300).style('opacity', 1);
            })
            .on('mousemove', function() {
                const [x, y] = d3.mouse(this);
                mask.attr('width', x);

                const xCenter = x / 2; 

                const percentage = kernel
                    .filter((d) => {
                        return xScale(d[0]!) <= x;
                    })
                    .reduce((sum, d) => sum + d[1]!, 0);

                text
                    .attr('x', xCenter)
                    .attr('y', y)
                    .text(`${(percentage * 100).toFixed(1)}%`);
            })
            .on('mouseleave', function() {
                mask.transition().duration(1000).attr('width', width);
                text.transition().duration(300).style('opacity', 0);
            });
        
        return;



        // const xScale = d3.scaleLinear()
        //     .domain([0, d3.max(data, (d: any) => parseInt(d[x]))!])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        //     .range([0, width]);

        const xAxis = this.svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));
            
        const histogram = d3.histogram()
            .value((d: any) => d[x])
            .domain(xScale.domain() as [number, number])
            .thresholds(xScale.ticks(bins));

        const histogramBins = histogram(data);

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(histogramBins, (d: d3.Bin<number, number>) => d.length)!]);

        const yAxis = this.svg.append('g')
            .call(d3.axisLeft(yScale));

        yAxis.selectAll('path').attr('stroke', '#DDD');
        yAxis.selectAll('.tick line').remove();

        xAxis.selectAll('path').attr('stroke', '#DDD');
        xAxis.selectAll('.tick line').remove();
        xAxis.selectAll('.tick text').attr('transform', 'translate(0, -3)');

        const colors = this.getColorScheme(xScale.domain());

        const bars = this.svg.selectAll('rect')
            .data(histogramBins)
            .enter()
            .append('rect')
                .attr('transform', (d: d3.Bin<number, number>) => `translate(${xScale(d.x0!)}, ${yScale(d.length)})`)
                .attr('width', (d: d3.Bin<number, number>) => xScale(d.x1!) - xScale(d.x0!) - 1)
                .attr('height', (d: d3.Bin<number, number>) => height - yScale(d.length))
                .style('fill', (d: d3.Bin<number, number>) => colors(d.x0!));
    }

    bandwidth(bandwidth: number): this {
        this.kdeConfig.bandwidth = bandwidth;
        return this;
    }
}

export default KDE;