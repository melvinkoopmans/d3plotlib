import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';

interface Node extends SimulationNodeDatum {
    id: string;
    [key: string]: unknown;
}

interface Edge extends SimulationNodeDatum {
    source: string | Node;
    target: string | Node;
}

interface SimulationEdge extends SimulationNodeDatum {
    source: Node;
    target: Node;
}

export interface NetworkStruct {
    nodes: Node[],
    edges: Edge[],
}

class Network {
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

    protected selector: string;

    protected width: number;

    protected height: number;

    constructor(selector: string, width: number, height: number) {
        this.selector = selector;
        this.width = width;
        this.height = height;

        this.svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    plot(network: NetworkStruct) {
        const { svg } = this;
        const scaleC = d3.scaleOrdinal<string>(d3.schemePastel1);

        d3.shuffle(network.nodes);
        d3.shuffle(network.edges);

        d3.forceSimulation<Node, Edge>(network.nodes)
            .force('ct', d3.forceCenter(300, 300))
            .force('ln', d3.forceLink<Node, Edge>(network.edges).distance(40).id((d: Node) => d.id))
            .force('hc', d3.forceCollide(10))
            .force('many', d3.forceManyBody())
            .on('end', function () {
                svg.selectAll('line').data<SimulationEdge>(network.edges as SimulationEdge[]).enter()
                    .append('line').attr('stroke', '#000')
                    .attr('x1', (d) => d.source.x!)
                    .attr('y1', (d) => d.source.y!)
                    .attr('x2', (d) => d.target.x!)
                    .attr('y2', (d) => d.target.y!);

                svg.selectAll('circle').data(network.nodes).enter()
                    .append('circle')
                    .attr('r', 10).attr('fill', (d, i) => scaleC(i as any))
                    .attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

                svg.selectAll('text').data(network.nodes).enter()
                    .append('text')
                    .attr('x', (d) => d.x!).attr('y', (d) => d.y! + 4)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 10)
                    .text((d) => d.id);
            })
    }
} 

export default Network;