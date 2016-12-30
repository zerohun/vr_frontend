function getKeyByValue(obj, val){
  return Object.keys(obj).filter(function(key) {return obj[key] === val})[0];
}

const BAR_SIZE = {
  width: 1,
  depth: 1 
};

function getDimScale(dimention, data, range){
  var dimField = getKeyByValue(data.dimensions, dimention);
  var values = data.data.map(function(d) { return d[dimField] });
  return d3.scaleLinear()
          .domain([0, d3.max(values)])
          .range(range)
}

function getTimeDimScale(dimention, data, range){
  var dimField = getKeyByValue(data.dimensions, dimention);
  var values = data.data.map(function(d) { return new Date(d[dimField]).valueOf() });
  return d3.scaleLinear()
          .domain([d3.min(values), d3.max(values)])
          .range(range)
}

document.addEventListener("DOMContentLoaded", function(e) { 
    var scene = document.querySelector('a-scene');
    if (scene.hasLoaded) {
      run();
    } else {
      scene.addEventListener('loaded', run);
    }

});

function run () {

  var scene = d3.select("a-scene")
  $.get('/dataset', function(res){
    var menuItems = scene.selectAll("a-entity.menu-item").data(res);
    menuItems.enter().append("a-entity")
      .attr('class', 'menu-item')
      .attr('mixin', function(d, i) {return 'font';} )
      .attr('text', function(d){ return 'text: ' + d.name })
      .attr('look-at', '[camera]')
      .attr('data-id', function(d){ return d.id })
      .attr('position',  function(d, i) {
        return '0 ' + i + ' 6'
      });

    var sceneEl = document.querySelector('a-scene');
    var menuItemEls = sceneEl.querySelectorAll('a-entity.menu-item');
    menuItemEls.forEach(function(menuItemEl){
      menuItemEl.addEventListener('click', function(){
        var id = $(this).data('id');
        $.get('/dataset/' + id, function(res){
          renderBarChart(res);
        });
      });
    });
  });
}

function renderBarChart(data){

  var scene = d3.select("a-scene");
  scene.selectAll("a-box").remove();
  scene.selectAll("a-entity.text").remove();

  var xDim = getKeyByValue(data.dimensions, 1);
  var yDim = getKeyByValue(data.dimensions, 3);
  var zDim = getKeyByValue(data.dimensions, 2);

  var xscale = getDimScale(1, data, [2, 10])
  var yscale = getDimScale(3, data, [0, 10])
  var zscale = getTimeDimScale(2, data, [2, 10])

  var bars = scene.selectAll("a-box").data(data.data)
  bars.enter().append("a-box").classed("bar", true)
    .attr('position', function(d,i) {
      // boxs are poitioned by their center so we
      // offset for their height
      var y = yscale(d[yDim])/2;
      var x = xscale(d[xDim]) - 6;
      var z = zscale(new Date(d[zDim].valueOf())) - 6;

      return x + " " + y + " " + z;
  }).attr('width', function(d) { return BAR_SIZE.width; })
    .attr('depth', function(d) { return BAR_SIZE.depth; })
    .attr('height', function(d) { return yscale(d[yDim]); })

  var texts = scene.selectAll("a-entity.text").data(data.data);
  texts.enter().append("a-entity")
    .attr('class', 'text')
    .attr('mixin', function(d, i) { return 'font';} )
    .attr('text', function(d){ return 'text: ' + d[yDim] })
    .attr('color', 'green')
    .attr('look-at', '[camera]')
    .attr('position', function(d, i) {
      var y = yscale(d[yDim]) + 0.5; 
      var x = xscale(d[xDim]) - 6;
      var z = zscale(new Date(d[zDim]).valueOf()) - 6;

      return x + " " + y + " " + z;
    });
}
