import * as d3 from 'd3';
import Baseplot from './Baseplot';

class Barplot extends Baseplot {
    protected barplotConfig: {
        isHorizontal: boolean,
        xAccessor: string,
        yAccessor: string,
    } = {
        isHorizontal: false,
        xAccessor: 'x',
        yAccessor: 'y',
    }

    plot(data: any, x: string, y: string): void {
        const { height } = this;
        const { tooltip } = this.config;
        const { yAccessor, isHorizontal } = this.barplotConfig;

        this.barplotConfig.xAccessor = isHorizontal ? x : x;
        this.barplotConfig.yAccessor = isHorizontal ? y : y;

        const { yAxis, yScale } = this.getYAxis(data);
        
        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, x, y);
            return;
        }

        yAxis.selectAll('.tick line').remove();
  
        if (!isHorizontal) {
            this.addHorizontalGridlines(yScale);
            yAxis.selectAll('path').remove();
        } else {
            yAxis.selectAll('path').attr('stroke', '#DDD')
        }

        const { xScale } = this.getXAxis(data);
        if (isHorizontal) {
            this.addVerticalGridlines(xScale as any, x);
        }

        const color = this.getColorScheme(xScale as any);

        let bars: d3.Selection<SVGRectElement, unknown, SVGElement, unknown>;
        const domainLength = xScale.domain().length;
        
        if (isHorizontal) {
            bars = this.svg.selectAll('rect').data(data).enter()
                .append('rect')
                .attr('x', 1)
                .attr('y', (d: any) => yScale(d[x]))
                .attr('height', yScale.bandwidth()) 
                .attr('width', 0)
                .attr('fill', (d: any) => color(d[x]))

            bars.transition()
                .ease(d3.easeElastic).delay((d, i) => i * (700 / domainLength)).duration(1250)
                .attr('width', (d: any) => xScale(d[y])! - 1);
        } else {
            bars = this.svg.selectAll('rect').data(data).enter()
                .append('rect')
                .attr('x', (d: any) => xScale(d[x])!)
                .attr('y', height)
                .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
                .attr('height', 0)
                .attr('fill', (d: any) => color(d[x]));

            bars.transition()
                .ease(d3.easeElastic).delay((d, i) => i * (700 / domainLength)).duration(1250)
                .attr('y', (d: any) => yScale(d[y])!)
                .attr('height', (d: any) => height - yScale(d[y])!);
        }

        if (tooltip) {
            bars
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler())
                .on('mousemove', tooltip.getMoveHandler((d: any) => d[yAccessor]));
        }
    }

    horizontal(): Barplot {
        this.barplotConfig.isHorizontal = true;
        return this;
    }

    protected getXAxis(data: any) {
        const { isHorizontal, xAccessor, yAccessor } = this.barplotConfig;
        let xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

        if (isHorizontal) {
            xScale = d3.scaleLinear()
                .domain([0, d3.max(data, (d: any) => 1.1 * d[yAccessor!] as number)!])
                .range([0, this.width]);
        } else {
            xScale = d3.scaleBand()
                .range([ 0, this.width ])
                .domain(data.map((d: any) => d[xAccessor!]))
                .padding(0.2);
        }
    
        const xAxis = this.svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(xScale as any));

        if (isHorizontal) {
            xAxis.selectAll('path').remove();
        } else {
            xAxis.selectAll('path').attr('stroke', '#DDD');
        }
        xAxis.selectAll('.tick line').remove();
        xAxis.selectAll('.tick text').attr('transform', 'translate(0, -3)');

        return { xAxis, xScale };
    }

    protected getYAxis(data: any) {
        const { isHorizontal, xAccessor, yAccessor } = this.barplotConfig;
        let yScale: any;

        if (isHorizontal) {
            yScale = d3.scaleBand()
                .range([0, this.height])
                .domain(data.map((d: any) => d[xAccessor!]))
                .padding(0.2);
        } else {
            yScale = d3.scaleLinear()
                .domain([0, d3.max(data, (d: any) => 1.1 * d[yAccessor!] as number)!])
                .range([this.height, 0]);
        }
    
        const yAxis = this.svg.append('g')
            .call(d3.axisLeft(yScale));

        return { yAxis, yScale };
    }
}

export default Barplot;