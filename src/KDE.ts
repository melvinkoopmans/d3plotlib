import * as d3 from 'd3';
import BaseChart from './BaseChart';

type Kernel = (x: number) => number;

class KDE extends BaseChart {
    private kdeConfig: {
        bandwidth: number,
    } = {
        bandwidth: 1.0
    };

    private state: {
        xScale: d3.ScaleLinear<number, number> | null,
        yScale: d3.ScaleLinear<number, number> | null,
        thresholds: number[],
        plotCalls: number,
    } = {
        xScale: null,
        yScale: null,
        thresholds: [],
        plotCalls: 0,
    }

    plot(data: any, x: string, color: string): KDE {
        const { defs, width, height } = this;
        const { bandwidth } = this.kdeConfig;
        let { plotCalls } = this.state;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, (d: any) => parseInt(d[x])) as [number, number]).nice()
            .range([0, width]);
        this.state.xScale = xScale;

        const thresholds = xScale.ticks(50);
        this.state.thresholds = thresholds;

        let kernel = this.kde(this.epanechnikov(bandwidth), this.state.thresholds, data, x);
        kernel = this.normalize(kernel);

        let domain = [0, d3.max(kernel, (d: any) => d[1])];
        if (this.state.yScale) {
            domain = [0, d3.max([domain[1], this.state.yScale.domain()[1]])];
        }

        const yScale = d3.scaleLinear()       
            .domain(domain)
            .range([height, 0]);
        this.state.yScale = yScale;

        this.svg.selectAll('.axes').remove();
        
        this.svg.append('g')
            .attr('class', 'axes')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        const yAxis = this.svg.append('g')
            .attr('class', 'axes')
            .call(d3.axisLeft(yScale));

        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, x, color);
            return this;
        }

        this.addHorizontalGridlines(yScale as any);

        this.svg.append('g').append('path')
            .attr('d', d3.line().curve(d3.curveBasis).x((d: any) => xScale(d[0])).y((d: any) => yScale(d[1]))(kernel)!)
            .attr('fill', 'none').attr('stroke', color);

        const area = d3.area()
            .curve(d3.curveBasis)
            .x0((d) => xScale(d[0]))
            .y0(height)
            .y1((d) => yScale(d[1]));

        const maskId = `auc-clip-${this.selector.replace('#', '')}-${plotCalls}`;
        const mask = defs!.append('clipPath')
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
            .attr('fill', color)
            .attr('opacity', 0.3);

        const text = this.svg.append('text')
            .style('opacity', 0)
            .style('color', '#000')

        this.svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('mouseenter', function() {
                text.transition().duration(300).style('opacity', 1);
            })
            .on('mousemove', function() {
                if (plotCalls > 0) {
                    return;
                }

                const [x, y] = d3.mouse(this);
                mask.attr('width', x);

                const percentage = kernel
                    .filter((d) => {
                        return xScale(d[0]!) <= x;
                    })
                    .reduce((sum, d) => sum + d[1]!, 0);

                text
                    .attr('x', x / 2)
                    .attr('y', y)
                    .text(`${(percentage * 100).toFixed(1)}%`);
            })
            .on('mouseleave', function() {
                mask.transition().duration(1000).attr('width', width);
                text.transition().duration(300).style('opacity', 0);
            });

        this.state.plotCalls += 1;

        return this;
    }

    bandwidth(bandwidth: number): this {
        this.kdeConfig.bandwidth = bandwidth;
        return this;
    }

    protected kde(kernel: Kernel, thresholds: number[], data: any, x: string): [number, number][] {
        return thresholds.map((t) => [t, d3.mean(data, (d: any) => kernel(t - d[x])) as number]);
    }

    protected normalize(kde: [number, number][]): [number, number][] {
        const total = d3.sum(kde, (d) => d[1]);
        return kde.map((d) => [d[0], d[1]! / total]);    
    }

    protected epanechnikov(bandwidth: number): Kernel {
        return (x: number) => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
    }
}

export default KDE;