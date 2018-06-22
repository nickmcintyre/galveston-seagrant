var stats, legendDiv, summaryDiv, cnv;
var openSans, robotoCondensed;
var floodMap, floodLayerGroup;
var shallowColor, deepColor, dryColor, noaaColor, ghfColor, clearColor;
var floodCategories, floodEvents, years, seaLevelRise;
var categorySelect, floodSelect, yearSelect, slrSelect;

function preload() {
  stats = loadJSON('data/stats.json');
  openSans = loadFont('fonts/OpenSans-Regular.ttf');
  robotoCondensed = loadFont('fonts/RobotoCondensed-Regular.ttf');
}

function setup() {
  cnv = createCanvas(180, 60);
  createSummary();
  setVariables();
  createNav();
  createMap();
  createLegend();
  createGuide();
  selectEvent();
  noLoop();
}

function createSummary() {
  summaryDiv = createDiv('');
  summaryDiv.id('summary');
  cnv.parent('summary');
}

function setVariables() {
  shallowColor = color('#FFFF00');
  deepColor = color('#FF0000');
  dryColor = color('#3f7c3b');
  clearColor = 'rgba(255, 255, 255, 0)';
  noaaColor = 'rgba(50, 86, 123, 0.9)';
  ghfColor = 'rgba(63, 124, 59, 0.9)';
  floodCategories = ['Buildings', 'Surface', 'None'];
  floodEvents = [
    'Ike',
    '1900',
    '500-yr',
    '200-yr',
    '100-yr',
    '50-yr',
    '25-yr',
    '10-yr'
  ];
  years = ['2000','2020', '2050', '2100'];
  seaLevelRise = ['Intermediate', 'Intermediate-high'];
}

function createNav() {
  const w = windowWidth/8,
        h = windowHeight/32;
  const x = windowWidth - w - 10;
  const selectY = (n) => n * (h + 5) + 10;
  const dimensions = {
    width: w/3,
    height: (n) => n * (h + 5) - 5,
    x: x - w/3 - 10,
    y: (n) => n * (h + 5) + 2
  }
  const styles = {
    zIndex: '9999',
    boxShadow: '0 1px 8px rgba(0,0,0,0.65)',
    fontFamily: '"Open Sans", sans-serif'
  };
  const selectProps = {
    x: x,
    y: selectY,
    w: w,
    h: h,
    dimensions: dimensions,
    styles: styles
  };
  createNavLabelBox(dimensions, styles);
  categorySelect = createSelect();
  floodSelect = createSelect();
  yearSelect = createSelect();
  slrSelect = createSelect();
  createScenarioSelect(categorySelect, floodCategories, 'category', 'Flooding', selectProps, 0);
  createScenarioSelect(floodSelect, floodEvents, 'flood', 'Storm', selectProps, 1);
  createScenarioSelect(yearSelect, years, 'year', 'Year', selectProps, 2);
  createScenarioSelect(slrSelect, seaLevelRise, 'slr', 'SLR', selectProps, 3);
}

function createNavLabelBox(dimensions, styles) {
  const labelDiv = createDiv('');
  labelDiv.id('nav-labels');
  labelDiv.position(dimensions.x, 10);
  labelDiv.size(dimensions.width, dimensions.height(4));
  labelDiv.style('z-index', styles.zIndex);
  labelDiv.style('background', noaaColor);
  labelDiv.style('box-shadow', styles.boxShadow);
  labelDiv.style('font-size', `${dimensions.width/4.5}px`);
  labelDiv.style('font-family', '"Roboto Condensed", sans-serif');
  labelDiv.style('color', 'white');
  labelDiv.style('text-align', 'right');
  labelDiv.style('padding-right', '5px');
}

function createScenarioSelect(select, options, id, label, props, n) {
  select.id(id);
  select.position(props.x, props.y(n));
  select.size(props.w, props.h);
  select.style('z-index', props.styles.zIndex);
  select.style('box-shadow', props.styles.boxShadow);
  select.style('font-family', props.styles.fontFamily);
  options.map(function (category) {
    select.option(category);
  });
  select.changed(selectEvent);
  const newLabel = createDiv(label);
  newLabel.parent('nav-labels');
  newLabel.position(0, props.dimensions.y(n));
  newLabel.size(props.dimensions.width, props.h+5);
}

function createMap() {
  const mapDiv = createDiv('');
  mapDiv.id('map');
  mapDiv.style('position', 'absolute');
  mapDiv.style('top', '0px');
  mapDiv.style('bottom', '0px');
  mapDiv.style('width', '100%');
  const mapCenter = L.latLng(29.299, -94.785),
        southWest = L.latLng(mapCenter.lat-0.005, mapCenter.lng-0.01),
        northEast = L.latLng(mapCenter.lat+0.005, mapCenter.lng+0.01),
        bounds = L.latLngBounds(southWest, northEast);
  floodMap = L.map('map', {
    center: mapCenter,
    zoom: 17,
    maxBounds: bounds
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    bounds: bounds,
    maxZoom: 19,
    minZoom: 16.5,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    noWrap: false,
    subdomains: 'abc'
  }).addTo(floodMap);
  floodLayerGroup = L.layerGroup();
}

function createLegend() {
  const w = 300,
        h = 20;
  const x = windowWidth - w - 10;
  const y = windowHeight - h - 40;
  const zIndex = '9999';
  const boxShadow = '0 1px 8px rgba(0,0,0,0.65)';
  legendDiv = createDiv('');
  legendDiv.id('legend');
  legendDiv.position(x, y);
  legendDiv.size(w, h);
  legendDiv.style('z-index', zIndex);
  legendDiv.style('box-shadow', boxShadow);
  legendDiv.style('background', clearColor);
  legendDiv.style('color', 'black');
  legendDiv.style('text-align', 'center');
  legendDiv.style('line-height', '20px');
  legendDiv.style('font-size', '12px');
  legendDiv.style('font-family', '"Open Sans", sans-serif');
}

function createGuide() {
  const w = 3*windowWidth/4,
        h = windowHeight/2;
  const x = windowWidth/8,
        y = windowHeight/4;
  const zIndex = '9999';
  const boxShadow = '0 1px 8px rgba(0,0,0,0.65)';
  const guideDiv = createDiv('');
  guideDiv.id('guide');
  guideDiv.position(x, y);
  guideDiv.size(w, h);
  guideDiv.style('overflow-y', 'scroll');
  guideDiv.style('z-index', zIndex);
  guideDiv.style('box-shadow', boxShadow);
  guideDiv.style('background', noaaColor);
  guideDiv.style('color', 'white');
  guideDiv.style('text-align', 'center');
  const closeDiv = createA('', '&times;&nbsp;');
  closeDiv.parent('guide');
  closeDiv.position(w-26, 0);
  closeDiv.style('font-size', '2em');
  closeDiv.style('text-decoration', 'none');
  closeDiv.style('color', 'white');
  closeDiv.mousePressed(() => guideDiv.hide());
  const headerDiv = createDiv('<h2>Welcome</h2>');
  headerDiv.parent('guide');
  headerDiv.style('font-family', '"Roboto Condensed", sans-serif');
  const messageDiv = createDiv(`
    <p>Use the dropdown menus above to visualize
    flooding scenarios from storm surge in Galveston, TX.
    Explore different combinations of flooding category,
    storm, year and sea level rise (SLR). Hover over any
    of the buildings studied &mdash; marked as circles &mdash;
    to learn about observed and projected imapcts.</p>
  `);
  messageDiv.parent('guide');
  messageDiv.style('padding-left', '10%');
  messageDiv.style('padding-right', '10%');
  messageDiv.style('font-family', '"Open Sans", sans-serif');
}

function updateSummary(props) {
  const w = 180,
        h = 60;
  const x = windowWidth - w - 10;
  const y = windowHeight - h - 60;
  const zIndex = '9999';
  const boxShadow = '0 1px 8px rgba(0,0,0,0.65)';
  const scenario = {
    'category': categorySelect.value(),
    'flood': floodSelect.value(),
    'year': yearSelect.value(),
    'slr': slrSelect.value()
  };
  const pct = stats[scenario.category][scenario.flood][scenario.year][scenario.slr];
  summaryDiv.position(x, y);
  summaryDiv.size(w, h);
  summaryDiv.style('z-index', zIndex);
  summaryDiv.style('background', clearColor);
  clear();
  cnv.position(0, 0);
  let msg, clr, pieStart, pieStop;
  if (props.avg === -1) {
    msg = 'No matches';
    clr = color(noaaColor);
    pieStart = 0;
    pieStop = radians(0.1);
  } else if (scenario.category === 'None') {
    msg = `${pct.toFixed(0)}% clear`;
    clr = color(ghfColor);
    pieStart = radians(360*(1-pct/100));
    pieStop = 0;
  } else {
    msg = `${pct.toFixed(0)}% flooded`;
    clr = lerpColor(shallowColor, deepColor, (props.avg - props.min)/props.range);
    clr =  color(`rgba(${clr.levels[0]},${clr.levels[1]},${clr.levels[2]},0.9)`);
    pieStart = 0;
    pieStop = radians(360*pct/100);
  }
  fill(clr);
  noStroke();
  textFont(openSans, 20);
  text(msg, 50, height/2 + 8);
  arc(width/6, height/2, height/2, height/2, pieStart, pieStop, PIE);
  noFill();
  stroke(clr);
  ellipse(width/6, height/2, height/2, height/2);
}

function updateMap(json) {
  floodLayerGroup.clearLayers();
  floodMap.removeLayer(floodLayerGroup);
  floodLayerGroup = L.layerGroup();
  const props = getLayerProperties(json);
  if (props.max >= 0) {
    updateFloodMarkers(json, props);
  }
  updateLegend(props);
  updateSummary(props);
  floodLayerGroup.addTo(floodMap);
}

function updateFloodMarkers(json, props) {
  const category = categorySelect.value();
  for (let i = 0; i < json.features.length; i++) {
    const coords = json.features[i].geometry.coordinates.reverse();
    const depth = json.features[i].properties.ft;
    let message, colorString;
    if (category === 'Buildings' || category === 'Surface') {
      const pct = (depth - props.min) / props.range;
      const rgbColor = hex(lerpColor(shallowColor, deepColor, pct).levels, 2);
      colorString =  `#${rgbColor[0]}${rgbColor[1]}${rgbColor[2]}`;
      if (category === 'Buildings') {
        message = `<p>${depth.toFixed(1)}ft inside.</p>`;
      } else {
        message = `<p>${depth.toFixed(1)}ft on surface.</p>`;
      }
    } else {
      colorString = dryColor;
      message = 'No flooding.';
    }
    const c = L.circle(coords, {
      radius: 5,
      color: colorString,
      fillColor: colorString
    });
    c.bindTooltip(message);
    c.addTo(floodLayerGroup);
  }
}

function updateLegend(props) {
  if (props.max === -1) {
    legendDiv.html('');
    legendDiv.style('background', noaaColor);
  } else if (props.max === 0) {
    legendDiv.html('');
    legendDiv.style('background', ghfColor);
  } else if (props.max > 0) {
    let cellString = '';
    legendDiv.html(cellString);
    legendDiv.style('background', clearColor);
    for (let i = 0; i < 5; i++) {
      const pct = i / 5;
      const rgbColor = lerpColor(shallowColor, deepColor, pct).levels;
      const cellColor =  `rgba(${rgbColor[0]},${rgbColor[1]},${rgbColor[2]},0.9)`;
      if (i === 0) {
        cellString = `${props.min.toFixed(1)}ft`;
      } else if (i === 4) {
        cellString = `${props.max.toFixed(1)}ft`;
      } else {
        cellString = '';
      }
      const cellDiv = createDiv(cellString);
      cellDiv.style('width', '60px');
      cellDiv.style('height', '20px');
      cellDiv.style('background', cellColor);
      cellDiv.style('float', 'left');
      cellDiv.parent('legend');
    }
  }
}

function getLayerProperties(json) {
  let props = {};
  if (json.features === undefined) {
    props['max'] = -1;
    props['min'] = -1;
    props['avg'] = -1;
  } else {
    const ft = [];
    for (let i = 0; i < json.features.length; i++) {
      append(ft, json.features[i].properties.ft);
    }
    props = {
      'max': max(ft),
      'min': min(ft),
      'avg': ft.reduce((a, b) => a + b) / ft.length
    }
  }
  props['range'] = props.max - props.min;
  return props;
}

function selectEvent() {
  const category = categorySelect.value();
  const flood = floodSelect.value();
  const year = yearSelect.value();
  const slr = slrSelect.value();
  const url = `data/${category}-${flood}-${year}-${slr}.json`;
  loadJSON(url, updateMap);
}
