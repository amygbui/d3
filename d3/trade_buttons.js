tradeType = {
  "E": ["tradeE", false],
  "P": ["tradeP", false]
};

const toggleTrades = (type) => {
  const button = document.getElementById(tradeType[type][0])
  button.onclick = () => {
    const newOpacity = tradeType[type][1] ? 0 : 1;
    tradeType[type][1] = tradeType[type][1] ? false : true;
    d3.selectAll(`#${tradeType[type][0]}`)
      .attr("opacity", newOpacity);
  }
};

toggleTrades("E");
toggleTrades("P");
