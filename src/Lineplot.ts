import { 
    select, scaleLinear, axisBottom, 
    axisLeft, line, ScaleLinear, 
    CurveFactory, curveLinear, easeLinear, 
    mouse, Selection
} from 'd3';
import { extent } from 'd3-array';
import Baseplot from './Baseplot';

type DataPoint = [number, number];
type Dataset = DataPoint[];

class Lineplot extends Baseplot {
    private lineConfig: {
        loaded: boolean,
        xScale: ScaleLinear<number, number> | null,
        yScale: ScaleLinear<number, number> | null,
        yAxis: Selection<SVGGElement, unknown, HTMLElement, unknown> | null,
        xAxis: Selection<SVGGElement, unknown, HTMLElement, unknown> | null,
        curveFactory: CurveFactory,
    } = {
        loaded: false,
        xScale: null,
        yScale: null,
        yAxis: null,
        xAxis: null,
        curveFactory: curveLinear,
    };

    private datasets: {
        data: Dataset,
        category: string | null,
        color: string| null,
    }[] = [];

    plot(data: Dataset, category: string | null = null, color: string | null = null): Lineplot {
        const { svg, width, height, isAutoAdjusted, datasets, selector } = this;
        let { loaded, xScale, yScale, yAxis, xAxis, curveFactory } = this.lineConfig;

        if (!loaded) {
            this.lineConfig.xScale = xScale = scaleLinear()
                .domain(extent(data, (d: DataPoint) => d[0]) as [number, number])
                .range([0, width]);

            this.lineConfig.yScale = yScale = scaleLinear()
                .domain(extent(data, (d: DataPoint) => d[1]) as [number, number])
                .range([height, 0]);

            this.lineConfig.yAxis = yAxis = svg.append('g')
                .call(axisLeft(yScale!));

            this.lineConfig.xAxis = svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(axisBottom(xScale!));

            svg.selectAll('.grid').remove();
            this.addHorizontalGridlines(yScale as any);

            if (!isAutoAdjusted) {
                this.autoAdjust(yAxis);
                this.plot(data, category, color);    
            }

            this.lineConfig.loaded = true;
        }

        yAxis?.selectAll('path').remove();
        yAxis?.selectAll('line').remove();

        xAxis?.selectAll('path').attr('stroke', '#DDD');
        xAxis?.selectAll('.tick line').remove();
        xAxis?.selectAll('.tick text').attr('transform', 'translate(0, -2)');

        if (!this.datasets.find((d) => d.category === category)) {
            this.datasets.push({
                data, category, color
            });
        }

        const xDomain = xScale?.domain()!;
        data = data
            .filter((d: DataPoint) => d[0] >= xDomain[0] && d[0] <= xDomain[1])
            .map<DataPoint>((d: DataPoint) => [xScale!(d[0]), yScale!(d[1])]);

        const path = svg.append('g').append('path')
            .attr('d', line().curve(curveFactory)(data)!)
            .attr('fill', 'none').attr('stroke', color || '#000');
        
        const totalLength = path.node()?.getTotalLength()!;

        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1000)
            .ease(easeLinear)
            .attr("stroke-dashoffset", 0);

        svg.selectAll('.vertical-ruler').remove();
        const ruler = svg.append('line')
            .attr('class', 'vertical-ruler')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', this.height)
            .attr('y2', 0)
            .attr('opacity', 0)
            .attr('stroke', '#DDD')
            .attr('stroke-width', 1);

        select(selector).selectAll('.vertical-ruler-tooltip').remove();
        const rulerTooltip = select(selector).append('div')
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0)
            .style('opacity', 0)
            .style('font-size', '12px')
            .attr('class', 'vertical-ruler-tooltip')
            .html('Tooltip content')

        const container = svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent');

        const pointCircles = svg.append('g')
            .attr('class', 'point-circles')
            .attr('opacity', 0);

        this.datasets.forEach((dataset) => {
            pointCircles.append('circle')
                .attr('r', 3)
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('fill', dataset.color || '#000');
        })

        container.on('mousemove', function() {
            const [x, y] = mouse(this);

            ruler.attr('x1', x).attr('x2', x);
            let tooltip = '';

            type TooltipPoint = {
                y: number,
                category: string | null,
                color: string | null,
            }
            const tooltipPoints: TooltipPoint[] = [];

            datasets.forEach((dataset, i) => {
                const closestPoint = dataset.data
                    .sort((a: DataPoint, b: DataPoint) => {
                        return Math.abs(x - xScale!(a[0])) > Math.abs(x - xScale!(b[0])) ? 1 : 0;
                    })[0];
    
                pointCircles.selectAll(`circle:nth-child(${i+1})`)
                    .attr('cx', xScale!(closestPoint[0]))
                    .attr('cy', yScale!(closestPoint[1]));

                tooltipPoints.push({
                    y: closestPoint[1],
                    category: dataset.category,
                    color: dataset.color,
                })
            })

            tooltipPoints
                .sort((a: TooltipPoint, b: TooltipPoint) => {
                    return b.y > a.y ? 1 : 0;
                })
                .forEach((point) => {
                    tooltip += `<div class="tooltip-legend" style="background: ${point.color}"></div> ${point.category}: ${point.y.toFixed(1)}<br>`;
                })

            rulerTooltip
                .style('transform', `translate(${x + 60}px, ${y}px)`)
                .html(tooltip);

            rulerTooltip.selectAll('.tooltip-legend')
            .style('display', 'inline-block')
            .style('width', '10px')
            .style('height', '10px')
            .style('border-radius', '50%')
            .style('margin-right', '3px')
            .style('transform', 'translateY(1px)')
        });

        container.on('mouseover', function() {
            ruler.transition().duration(250).attr('opacity', 1);
            rulerTooltip.transition().duration(250).style('opacity', 1);
            pointCircles.transition().duration(250).attr('opacity', 1);
        })

        container.on('mouseleave', function() {
            ruler.transition().duration(250).attr('opacity', 0);
            rulerTooltip.transition().duration(250).style('opacity', 0);
            pointCircles.transition().duration(250).attr('opacity', 0);
        })

        return this;
    }

    curve(factory: CurveFactory): Lineplot {
        this.lineConfig.curveFactory = factory;
        return this;
    }
}

export default Lineplot;