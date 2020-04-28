import { 
    select, scaleLinear, axisBottom, 
    axisLeft, line, ScaleLinear, 
    CurveFactory, curveLinear 
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
        curveFactory: CurveFactory,
    } = {
        loaded: false,
        xScale: null,
        yScale: null,
        curveFactory: curveLinear
    };

    private datasets: Dataset[] = [];

    plot(data: Dataset, category?: string | null, color?: string | null): Lineplot {
        const { svg, width, height, isAutoAdjusted } = this;
        let { loaded, xScale, yScale, curveFactory } = this.lineConfig;

        if (!loaded) {
            this.lineConfig.xScale = xScale = scaleLinear()
                .domain(extent(data, (d: DataPoint) => d[0]) as [number, number])
                .range([0, width]);

            this.lineConfig.yScale = yScale = scaleLinear()
                .domain(extent(data, (d: DataPoint) => d[1]) as [number, number])
                .range([height, 0]);

            const yAxis = svg.append('g')
                .call(axisLeft(yScale!));

            svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(axisBottom(xScale!));

            if (!isAutoAdjusted) {
                this.autoAdjust(yAxis);
                this.plot(data, category, color);    
            }

            this.lineConfig.loaded = true;
        }

        const xDomain = xScale?.domain()!;
        data = data
            .filter((d: DataPoint) => d[0] >= xDomain[0] && d[0] <= xDomain[1])
            .map<DataPoint>((d: DataPoint) => [xScale!(d[0]), yScale!(d[1])]);

        // svg.append('g').selectAll('circle')
        //     .data(data).enter().append('circle')
        //     .attr('r', 3)
        //     .attr('cx', (d: DataPoint) => d[0])
        //     .attr('cy', (d: DataPoint) => d[1]);

        svg.append('g').append('path')
            .attr('d', line().curve(curveFactory)(data)!)
            .attr('fill', 'none').attr('stroke', color || '#000');

        return this;
    }

    curve(factory: CurveFactory): Lineplot {
        this.lineConfig.curveFactory = factory;
        return this;
    }
}

export default Lineplot;