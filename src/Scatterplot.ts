import * as d3 from 'd3';
import BaseChart from './BaseChart';

class Scatterplot extends BaseChart {
    private state: {
        xInitialDomain: [number, number] | null,
        xScale: d3.ScaleLinear<number, number> | null,
        xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null,
        yInitialDomain: [number, number] | null,
        yScale: d3.ScaleLinear<number, number> | null,
        yAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null,
        brush: d3.BrushBehavior<unknown> | null,
        brushElement: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null,
        brushIdleTimout: NodeJS.Timeout | null,
    } = {
        xInitialDomain: null,
        xScale: null,
        xAxis: null,
        yInitialDomain: null,
        yScale: null,
        yAxis: null,
        brush: null,
        brushElement: null,
        brushIdleTimout: null,
    }

    plot(data: [number, number, number?][]) {
        const { svg, width, height } = this;
        
        const xDomain = d3.extent(data.map((d) => d[0])) as [number, number];
        const xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([0, width]);
        this.state.xInitialDomain = xDomain;
        this.state.xScale = xScale;

        const yDomain = d3.extent(data.map((d) => d[1])) as [number, number];
        const yScale = d3.scaleLinear()
            .domain(yDomain)
            .range([height, 0]);
        this.state.yInitialDomain = yDomain;
        this.state.yScale = yScale;

        const sizeScale = d3.scaleLinear()
            .domain(d3.extent(data.map((d) => (d[2] || 1))) as [number,number])
            .range([1.0, 2]);

        const xAxis = svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale)); 
        this.state.xAxis = xAxis;

        const yAxis = svg.append('g')
            .call(d3.axisLeft(yScale));
        this.state.yAxis = yAxis;

        this.addHorizontalGridlines(yScale as any);
        this.addVerticalGridlines(xScale as any);

        svg.append('g').selectAll('circle')
            .data(data).enter()
            .append('circle')
                .attr('r', (d: any) => 4 * sizeScale(d[2] || 1))
                .attr('cx', (d: any) => xScale(d[0]))
                .attr('cy', (d: any) => yScale(d[1]))
                .attr('stroke', '#FFF')
                .attr('stroke-width', 1);

        const brush = d3.brush()
            .extent([[0,0], [width, height]])
            .on('end', this.updateBrush.bind(this));

        const brushElement = svg.append('g')
            .attr('class', 'brush')
            .call(brush);
    
        this.state.brush = brush;
        this.state.brushElement = brushElement;
    }

    updateBrush() {
        const { 
            xInitialDomain, xScale, xAxis, 
            yInitialDomain, yAxis, yScale,
            brush, brushElement, brushIdleTimout
        } = this.state;

        if (!xInitialDomain || !xScale || !xAxis 
            || !yInitialDomain || !yScale || !yAxis
            || !brush || !brushElement || !yScale ) {
            return;
        }

        const extent = d3.event.selection;

        if (!extent) {
            if (!brushIdleTimout) {
                return this.state.brushIdleTimout = setTimeout(() => this.state.brushIdleTimout = null, 350);
            }
            xScale.domain(xInitialDomain);
            yScale.domain(yInitialDomain);
        } else {
            xScale.domain([xScale.invert(extent[0][0]), xScale.invert(extent[1][0])]);
            yScale.domain([yScale.invert(extent[1][1]), yScale.invert(extent[0][1])]);
            this.svg.select('.brush').call(brush.move as any, null);
        }
        this.state.xScale = xScale;
        this.state.yScale=  yScale;
    
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
        this.svg
            .selectAll('circle')
            .transition().duration(1000)
            .attr('cx', (d: any) => xScale(d[0]))
            .attr('cy', (d: any) => yScale(d[1]));
    }
}

export default Scatterplot;