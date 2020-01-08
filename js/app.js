const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr("height");

const quarter = {
	"01": "Q1",
	"04": "Q2",
	"07": "Q3",
	"10": "Q4"
}

let m2q = d => quarter[d];

const tooltip = d3.select(".barchart")
					.append("div")
					.attr("id", "tooltip")
					.style("opacity", 0);

const overlay = d3.select(".barchart")
					.append("div")
					.attr("class", "overlay")
					.style("opacity", 0);

const render = data => {
	const margin = { top: 20, right: 40, bottom: 40, left: 40 };
	const innerWidth = width - margin.left - margin.right;
  	const innerHeight = height - margin.top - margin.bottom;

	const yearsValue = data.map(item => new Date(item[0]));	
	const yearRange = [d3.min(yearsValue), d3.max(yearsValue)];
	const xS = d3.scaleTime()
				.domain([yearRange[0], yearRange[1]])
				.range([0, innerWidth]);
	const xValue = yearsValue.map(item => xS(item));
	const xAxis = d3.axisBottom()
					.scale(xS);
	const xag = svg.append('g')
				.call(xAxis)
				.attr('id', 'x-axis')
				.attr('transform', 'translate(0, 401)');

	const gdpValue = data.map(item => item[1]);
	const gdpRange = [d3.min(gdpValue), d3.max(gdpValue)];
	const yS = d3.scaleLinear()
				.domain([0, gdpRange[1]])
				.range([0, innerHeight]);
	const yValue = gdpValue.map(item => yS(item));
	
	const yaS = d3.scaleLinear()
					.domain([0, gdpRange[1]])
					.range([innerHeight, 0]);
	const yAxis = d3.axisRight(yaS);
	const yag = svg.append('g')
					.call(yAxis)
					.attr('id', 'y-axis')
					.attr('transform', `translate(884, 0)`);

	const years = yearsValue.map(item => {
		item = moment(item).format('YYYY-MM-DD');
		return item.substring(0, 4) + ' ' + m2q(item.substring(5, 7));
	});

  	const barWidth = innerWidth / 275;
  	const gLabel = svg.append('text')
  		.attr('transform', 'rotate(-90)')
  		.attr('x', -innerHeight/2 - 60)
  		.attr('y', 940)
  		.text('Gross Domestic Product');
	
  	const gDescription = svg.append('text')
  		.attr('x', innerWidth / 2 - 180)
  		.attr('y', height - 20)
  		.text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
  		.attr('class', 'description');

  	const g = svg.append('g');
  	
  	const barBasic = g.selectAll('rect')
	  	.data(yValue)
	  	.enter()
	  	.append("rect")
	  	.attr('class', 'bar')
	  	.attr('x', (d,i) => xValue[i])
	  	.attr('y', (d,i) => innerHeight - yValue[i])
	  	.attr('data-date', (d,i) => moment(yearsValue[i]).format('YYYY-MM-DD'))
	  	.attr('data-gdp', (d,i) => gdpValue[i])
	  	.attr('width', barWidth)
	  	.attr('height', (d,i) => yValue[i])
	  	.attr('fill', '#3D9970');

	barBasic.on('mouseover', function (d, i){
		overlay.transition()
		.duration(0)
		.style('height', innerHeight - yValue[i] + 'px')
		.style('width', barWidth + 'px')
		.style('opacity', .9)
		.style('left', i * barWidth + 0 + 'px')
		.style('top', innerHeight - yValue[i] + 'px')
		.style('transform', 'translateX(60px)');
		
		tooltip.transition()
		.duration(200)
		.style('opacity', .9);

		tooltip.html(years[i] + '<br>' + '$' + gdpValue[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion')
		.attr('data-date', moment(yearsValue[i]).format('YYYY-MM-DD'))
		.style('left', i * barWidth + 30 + 'px')
    	.style('top', innerHeight + 'px')
    	.style('transform', 'translateX(60px)');
	});

	barBasic.on('mouseout', function (d, i){
		tooltip.transition()
		.duration(200)
		.style('opacity', 0);

		overlay.transition()
		.duration(200)
		.style('opacity', 0);
	});
} 

document.addEventListener('DOMContentLoaded', function(){
	const data_source = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"

    const req=new XMLHttpRequest();
    req.open("GET",data_source,true);
    req.send();
    req.onload = function(){
    	const json = JSON.parse(req.responseText);

    	const title = json.source_name + " of USA"
    	const data = json.data;
    	const dataset = json.data.map(item => [item[0],item[1]]);
    	render(dataset);
	};	
});