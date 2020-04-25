import * as d3 from 'd3';

class Barplot {
    selector: string;

    width: number;

    height: number;

    margin: {
        top: number,
        right: number,
        bottom: number,
        left: number
    } = {
        top: 10,
        right: 30,
        bottom: 20,
        left: 60,
    }

    constructor(selector: string, width: number, height: number) {
        this.selector = selector;
        this.width = width;
        this.height = height;
    }

    plot(data: any) {
        const { width, height, margin } = this;

        const svg = d3.select(this.selector)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x: any = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map((d: any) => d['x']))
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 1000])
            .range([height, 0]);

        svg.append('g')
            .call(d3.axisLeft(y));

        const yAxis = d3.axisLeft(y);
        svg.append('g')			
            .attr('class', 'grid')
            .call(yAxis.tickSize(-width).tickFormat(() => ''))
            .selectAll('line')
            .attr('transform', 'translate(1, 0)')
            .attr('stroke', '#DDD');

        const xAxis = d3.axisBottom(x);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append('text')
            .text('Amount on board')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '12px')
            .attr('font-size', '12px')
            .style('text-anchor', 'middle')

        svg.selectAll('rect').data(data).enter()
            .append('rect')
            .attr('x', (d: any) => x(d['x']))
            .attr('y', height)
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', '#69b3a2')
            .transition().ease(d3.easeElastic).delay(700).duration(1250)
            .attr('y', (d: any) => y(d['y']))
            .attr('height', (d: any) => height - y(d['y']));
    }
}

export default Barplot;