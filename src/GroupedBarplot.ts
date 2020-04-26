import * as d3 from 'd3';
import Baseplot from './Baseplot';

class GroupedBarplot extends Baseplot {
    plot(data: any, groupBy: string, subgroups: string[]) {
        const { tooltip } = this.config;
        const groups = d3.map(data, (d: any) => d[groupBy]).keys();

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, (d: any) => {
                return d3.max(subgroups, (s: any) => {
                    return d[s] as number;
                });
            })!])
            .range([this.height, 0]);
        this.addHorizontalGridlines(yScale as any);

        const yAxis = this.svg.append('g')
            .attr('transform', 'translate(5, 0)')
            .call(d3.axisLeft(yScale));

        if (!this.isAutoAdjusted) {
            this.autoAdjust(yAxis);
            this.plot(data, groupBy, subgroups);
            return;
        }
        
        yAxis.selectAll('path').remove();
        yAxis.selectAll('line').remove();

        const xScale = d3.scaleBand()
            .domain(groups)
            .range([0, this.width])
            .padding(0.2);
    
        const xAxis = d3.axisBottom(xScale).tickSize(0);
        this.svg.append('g')
            .attr('transform', `translate(0, ${this.height})`)
            .call(xAxis);

        const xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, xScale.bandwidth()])
            .padding(0);

        const color = this.getColorScheme(subgroups);
        
        const bars: d3.Selection<SVGRectElement, {key: string, value: any }, SVGGElement, unknown> = this.svg.append('g')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
                .attr('transform', (d: any) => `translate(${xScale(d[groupBy])}, 0)`)
            .selectAll('rect')
            .data((d) => subgroups.map((key) => ({ key, value: d[key] })))
            .enter().append('rect')
                .attr('x', (d) => xSubgroup(d.key)!)
                .attr('y', this.height)
                .attr('width', xSubgroup.bandwidth())
                .attr('height', 0)
                .attr('fill', (d) => color(d.key));
        
        bars.transition().ease(d3.easeElastic).duration(1250)
            .attr('y', (d) => yScale(d.value))
            .attr('height', (d) => this.height - yScale(d.value));

        if (tooltip) {
            bars
                .on('mouseover', tooltip.getOverHandler())
                .on('mouseleave', tooltip.getLeaveHandler())
                .on('mousemove', tooltip.getMoveHandler((d: any) => d.value));
        }
    }
} 

export default GroupedBarplot;