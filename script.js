// Constants for dimensions
const width = 1080;
const height = 540;
const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const legendWidth = 400;
const legendHeight = 20;
const legendPadding = 10;

// Select the main element for the heat map
const svg = d3
  .select("main")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data
d3.json(
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((data) => {
    // Calculate the minimum and maximum temperature values from the dataset
    const minTemp =
      data.baseTemperature + d3.min(data.monthlyVariance, (d) => d.variance);
    const maxTemp =
      data.baseTemperature + d3.max(data.monthlyVariance, (d) => d.variance);

    // Define a color scale for the cells
    const colorScale = d3
      .scaleQuantize()
      .domain([minTemp, maxTemp]) // Define the domain based on the range of temperatures
      .range([
        "#053061",
        "#2166ac",
        "#4393c3",
        "#92c5de",
        "#d1e5f0",
        "#fddbc7",
        "#f4a582",
        "#d6604d",
        "#b2182b",
      ]); // Define the range of colors

    // Define the x-axis scale
    const xScale = d3
      .scaleBand()
      .domain(data.monthlyVariance.map((d) => d.year))
      .range([0, width]);

    // Define the y-axis scale
    const yScale = d3
      .scaleBand()
      .domain(data.monthlyVariance.map((d, i) => d.month - 1))
      .range([0, height]);

    // Create x-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(xScale.domain().filter((year) => year % 10 === 0))
      .tickFormat(d3.format("d"));

    // Create y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat((month) => {
      const date = new Date(0);
      date.setUTCMonth(month);
      return d3.utcFormat("%B")(date);
    });

    // Append x-axis to SVG
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // Append y-axis to SVG
    svg.append("g").attr("id", "y-axis").call(yAxis);

    // Select the header element
    const header = d3.select("header");

    // Add title
    header
      .append("h1")
      .text("Monthly Global Land-Surface Temperature")
      .attr("id", "title");

    // Add description
    header
      .append("h3")
      .text(
        `${data.monthlyVariance[0].year} - ${
          data.monthlyVariance[data.monthlyVariance.length - 1].year
        }: base temperature ${data.baseTemperature} ℃`
      )
      .attr("id", "description");

    // Append <rect> elements representing the cells of the heatmap
    svg
      .selectAll(".cell")
      .data(data.monthlyVariance)
      .enter()
      .append("rect")
      .attr("class", "cell")
      // Set attributes for each <rect> element based on the data
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      // Set the fill color based on the temperature value using the color scale
      .attr("fill", (d) => colorScale(data.baseTemperature + d.variance))
      // Set data attributes for each cell
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => data.baseTemperature + d.variance);

    // Create a legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${margin.left}, ${height + margin.top + legendPadding})`
      );

    // Define a linear gradient for the legend
    const gradient = legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "color-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // Add color stops to the gradient based on the color scale
    gradient
      .selectAll("stop")
      .data(colorScale.range())
      .enter()
      .append("stop")
      .attr("offset", (d, i) => i / (colorScale.range().length - 1))
      .attr("stop-color", (d) => d);

    // Append rectangles for the color legend with at least 4 different fill colors
    legend
      .selectAll("rect")
      .data(colorScale.range())
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth / (colorScale.range().length - 1)))
      .attr("y", 0)
      .attr("width", legendWidth / (colorScale.range().length - 1))
      .attr("height", legendHeight)
      .attr("fill", (d) => d);

    // Append text for the minimum temperature value
    legend
      .append("text")
      .attr("x", -legendPadding)
      .attr("y", legendHeight / 2)
      .attr("dy", "0.35em")
      .style("text-anchor", "end")
      .text(minTemp.toFixed(1) + " ℃");

    // Append text for the maximum temperature value
    legend
      .append("text")
      .attr("x", legendWidth + legendPadding + 50)
      .attr("y", legendHeight / 2)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .text(maxTemp.toFixed(1) + " ℃");

    // Create an array of month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Create the tooltip element
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Define event listeners for mouseover and mouseout
    svg
      .selectAll(".cell")
      .on("mouseover", (event, d) => {
        // Calculate the position of the tooltip
        const xPos = event.pageX + 10;
        const yPos = event.pageY - 30;

        // Update tooltip content based on the data associated with the cell
        tooltip
          .html(
            `<strong>Date:</strong> ${monthNames[d.month - 1]} ${d.year}<br>
          <strong>Variance:</strong> ${d.variance.toFixed(1)}<br>
          <strong>Temperature:</strong> ${(
            data.baseTemperature + d.variance
          ).toFixed(1)} ℃<br>
          <strong>Data Year:</strong> ${d.year}`
          )
          // Include data-year property
          .attr("data-year", d.year)
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .style("opacity", 0.9);
      })
      .on("mouseout", () => {
        // Hide the tooltip on mouseout
        tooltip.style("opacity", 0);
      });
  })
  .catch((error) => console.log("Error:", error));
