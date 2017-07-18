let bboList, tradeList;

const margin = { top: 20, right: 20, bottom: 40, left: 50 },
width = 650 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

const formatTime = d3.timeParse("%H:%M:%S.%L");

d3.json("../stock.json", (error, json) => {
  bboList = json.bboList;
  tradeList = json.tradeList;

  // set range for x and y axes
  const x = d3.scaleTime()
    .domain([
      d3.min(bboList, d => formatTime(d.timeStr)),
      d3.max(bboList, d=> formatTime(d.timeStr))
    ])
    .range([0, width]);

  const y1 = d3.scaleLinear()
    .domain([
      d3.min(bboList, function(d) { return d.bid / 10000 }),
      d3.max(bboList, function(d) { return d.ask / 10000; }
    )])
    .range([height, 0]);

  // appends scale to x and y axes
  const xAxis = d3.axisBottom()
    .scale(x);

  const yAxis = d3.axisLeft()
    .scale(y1)
    .ticks(13);

  // set properties to svg
  const svg = d3.select("svg#area")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // ADD CURVES
  const curve = (action) => {
    const areaCurve = d3.area()
      .x(function(d) { return x(formatTime(d.timeStr)); })
      .y1(function(d) {
        let xVal = action === "ask" ? d.ask : d.bid;
        return y1(xVal / 10000);
      })
      .y0(height)
      .curve(d3.curveStepAfter)

    return areaCurve
  }

  const appendArea = (color, area) => {
    return svg.append("path")
      .datum(bboList)
      .attr("class", "area")
      .attr("fill", color)
      .attr("d", area);
  }

  appendArea("gold", curve("ask"));
  appendArea("steelblue", curve("bid"));

  // ADD X AND Y AXES
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // ADD TRADES W/ MOUSEOVER DATA
  const convertSecs = time => {
    const totalSecs = time / 1000000000,
          hours = Math.floor(totalSecs / 60 / 60),
          mins = Math.floor(totalSecs / 60 % 60),
          secs = Math.round(totalSecs % 60 * 1000) / 1000;

    return `${hours}:${mins}:${secs}`;
  }

  const placeTradeDots = type => {
    const tradeType = type === "E" ? "tradeE" : "tradeP";
    const color = type === "E" ? "green" : "red";

    svg.selectAll(".dot")
      .data(tradeList.filter(trade => trade.tradeType === type))
      .enter().append("circle")
      .attr("id", tradeType)
      .attr("r", 1.25)
      .attr("cx", d => x(formatTime(convertSecs(d.time))))
      .attr("cy", d => y1(d.price / 10000))
      .style("fill", d => color)
      .attr("opacity", 0)
      .on("mouseover", d => {
        tooltip.transition()
        .duration(200)
        .style("opacity", .9)

        tooltip.html(
          `Time: ${convertSecs(d.time)}` + "<br />" +
          `Price: ${d.price / 10000}` + "<br />" +
          `Shares: ${d.shares}`
        )
      })
      .on("mouseout", function(d) {
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      });
  };

  placeTradeDots("E");
  placeTradeDots("P");
})
