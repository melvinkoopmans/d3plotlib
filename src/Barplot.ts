import * as d3 from 'd3';

class Barplot {
    private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    private width: number;

    private height: number;

    private config: {
        isHorizontal: boolean,
        yLabel: string | null,
        margin: {
            top: number,
            right: number,
            bottom: number,
            left: number
        },
        color: string,
        xAccessor: string | null,
        yAccessor: string | null,
    } = {
        isHorizontal: false,
        yLabel: null,
        margin: {
            top: 10,
            right: 30,
            bottom: 20,
            left: 60,
        },
        color: '#000',
        xAccessor: null,
        yAccessor: null
    }

    constructor(selector: string, width: number, height: number) {
        const { margin } = this.config;

        this.svg = d3.select(selector)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.width = width;
        this.height = height;
    }

    plot(data: any, x: string, y: string): void {
        const { height } = this;
        const { isHorizontal, yLabel, margin, color } = this.config;

        this.config.xAccessor = isHorizontal ? x : x;
        this.config.yAccessor = isHorizontal ? y : y;

        const { yScale } = this.getYAxis(data);
        if (!isHorizontal) {
            this.addHorizontalGridlines(yScale);
        }

        const { xScale } = this.getXAxis(data);
        if (isHorizontal) {
            this.addVerticalGridlines(xScale);
        }

        if (yLabel) {
            this.svg.append('text')
                .text(yLabel)
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left)
                .attr('x', 0 - (height / 2))
                .attr('dy', '12px')
                .attr('font-size', '12px')
                .style('text-anchor', 'middle');
        }

        if (isHorizontal) {
            this.svg.selectAll('rect').data(data).enter()
                .append('rect')
                .attr('x', 1)
                .attr('y', (d: any) => yScale(d[x]))
                .attr('height', yScale.bandwidth()) 
                .attr('width', 0)
                .attr('fill', color)
                .transition().ease(d3.easeElastic).delay(700).duration(1250)
                .attr('width', (d: any) => xScale(d[y]) - 1);
        } else {
            this.svg.selectAll('rect').data(data).enter()
                .append('rect')
                .attr('x', (d: any) => xScale(d[x]))
                .attr('y', height)
                .attr('width', xScale.bandwidth())
                .attr('height', 0)
                .attr('fill', color)
                .transition().ease(d3.easeElastic).delay(700).duration(1250)
                .attr('y', (d: any) => yScale(d[y])!)
                .attr('height', (d: any) => height - yScale(d[y])!);
        }
    }

    horizontal(): Barplot {
        this.config.isHorizontal = true;
        return this;
    }

    color(color: string): Barplot {
        this.config.color = color;
        return this;
    }

    yLabel(label: string): Barplot {
        this.config.yLabel = label;
        return this;
    }

    private getXAxis(data: any) {
        const { isHorizontal, xAccessor, yAccessor } = this.config;
        let xScale: any;

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

    
        const xAxis = d3.axisBottom(xScale);
        this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);

        return { xAxis, xScale };
    }

    private getYAxis(data: any) {
        const { isHorizontal, xAccessor, yAccessor } = this.config;
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
    
        const yAxis = d3.axisLeft(yScale);
        this.svg.append('g')
            .call(yAxis);

        return { yAxis, yScale };
    }

    private addHorizontalGridlines(yScale: d3.ScaleBand<string>) {
        const yAxis = d3.axisLeft(yScale);
        const g = this.svg.append('g')			
            .attr('class', 'grid')
            .call(yAxis.tickSize(-this.width).tickFormat(() => ''));


        g.selectAll('line')
            .attr('transform', 'translate(1, 0)')
            .attr('stroke', '#DDD');

        g.selectAll('path').remove();
    }

    private addVerticalGridlines(xScale: any) {
        const { xAccessor } = this.config;
        const xAxis = d3.axisBottom(xScale);
        const g = this.svg.append('g')
            .attr('class', 'grid')
            .call(xAxis.tickSize(this.height).tickFormat(() => ''));

        g.selectAll('line')
            .attr('x', (d: any) => xScale(d[xAccessor!]))
            .attr('stroke', '#DDD')
        
        g.selectAll('.tick:first-of-type').remove();

        g.selectAll('path').remove();
    }
}

export default Barplot;