import * as d3 from 'd3';

// Create a line chart with given data
function createLineChart(
  container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  data: Array<{x: number, y: number}>, 
  width: number = 800,
  height: number = 400
): void {
  // Clear previous content
  container.selectAll('*').remove();

  // Set up scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x) as [number, number])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y) as number])
    .range([height, 0]);

  // Create SVG
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  // Add line
  const line = d3.line<{x: number, y: number}>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#4A90E2')
    .attr('stroke-width', 2)
    .attr('d', line);

  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .call(d3.axisLeft(yScale));
}

// Create a bar chart with given data
function createBarChart(
  container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  data: Array<{label: string, value: number}>, 
  width: number = 800,
  height: number = 400
): void {
  // Clear previous content
  container.selectAll('*').remove();

  // Set up scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) as number])
    .range([height, 0]);

  // Create SVG
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  // Add bars
  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.label) as number)
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - yScale(d.value))
    .attr('fill', '#4A90E2');

  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .call(d3.axisLeft(yScale));
}

// Create a scatter plot with given data
function createScatterPlot(
  container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  data: Array<{x: number, y: number}>, 
  width: number = 800,
  height: number = 400
): void {
  // Clear previous content
  container.selectAll('*').remove();

  // Set up scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x) as [number, number])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y) as number])
    .range([height, 0]);

  // Create SVG
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  // Add points
  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 5)
    .attr('fill', '#4A90E2');

  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .call(d3.axisLeft(yScale));
}

export {
  createLineChart,
  createBarChart,
  createScatterPlot
};
