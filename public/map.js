//FOR MAP 
// Width and height
var chart_width     =  1900; // window.innerWidth - 1900
var chart_height    =  500; 
var centered;

var numCountry = 17;
var objs = [];

// for(i = 0; i < numCountry; i++) {
//     objs.push('country' + i);
// }

function close(el) {
    document.querySelector(el).style.display = 'none';
}

function exit() {
    document.querySelector('.textbox').classList.toggle('visible');
    document.querySelector('.dp').classList.toggle('grow');    
    document.querySelector('#intro').style.top = '90%';
}


function back() {
    if(document.querySelector('.back').style.display == "block") {
        x = chart_width / 2;
        y = chart_height / 2;
        k = 1;
        centered = null;

        close('.back');
        close('.infoBox'); //this doesn't run
    
        map.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });
        
        map.transition()
            .duration(750)
            .attr("transform", "translate(" + chart_width / 2 + "," + chart_height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
    }
}


var Country = function(name, description) {
    this.name = name;
    this.description = description;
}

Country.prototype.displayCountry = function() {
    
    var html = '<div><div class="name">%name%</div><div class="description"><p>%description%</p></div></div>';
    newhtml = html.replace('%name%', this.name);
    newhtml = newhtml.replace('%description%', this.description);
    
    return newhtml;   
}

//for Map
var projection = d3.geoMercator()
.center([0,0])    
.scale((chart_width - 3) / (2 * Math.PI))
.rotate([-10,0])
.translate([chart_width / 2, chart_height / 2]);

var path = d3.geoPath()
.projection(projection);

// Create SVG
var svg             =   d3.select("#chart")
    .append("svg")
    .attr('viewBox', '-100 -300 2100 900')
    .attr('preserveAspect', 'xMidYMid');

var map             =   svg.append( 'g' )
    .attr( 'id', 'map' );


var tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

var infoBox = d3.select("body").append('div')
    .attr("class", "infoBox")
    .style("opacity", 0);

// load in data Data
d3.json( '/senddata', function( food_data ){
    //add data to the same cities in both dataset
    d3.json( '/assets/world.json', function( world_data ){
        world_data.features.forEach(function(us_e, us_i){
            food_data.forEach(function(z_e,z_i){
                if( us_e.properties.name !== z_e.country ){
                    return null;
                }
                world_data.features[us_i].properties.color  =  z_e.color;              
                world_data.features[us_i].properties.description  =  z_e.description;           
            });
        });

        //apend data
        map.selectAll('path')
            .data( world_data.features )
            .enter()
            .append('path')
            .attr('class', 'path')
            .attr('d', path)
            .attr('fill', function( d, i ){
                var country = d.properties.color;
                return country ? d.properties.color : '#ddd'; //only color in those with data
               // return '#ddd';
            })
            .attr('stroke', function(d) {
                return '#fff';
            })
            .attr('stroke-width', function(d) {
                return 0.7;
            })
            .on("mouseover", function(d) {
                d3.select(this)
                .transition()
                .duration(100)
                .style('stroke-width', 6);

                tooltip
                    .style('display', 'block')
                    .style('opacity', 1)
                    .style("left", (d3.event.pageX + 8) + "px")   
                    .style("top", (d3.event.pageY - 20) + "px")
                    .text(d.properties.name);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                .transition()
                .duration(100)
                .style('stroke-width', 0.7);
            })
            .on("click", function(d) {
                                    
                var x, y, k;
                
                document.querySelector('.back').style.display = 'block'; 
                document.querySelector('.infoBox').style.display = 'block';   
  
                
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;

                map.transition()
                    .duration(500)
                    .attr("transform", "translate(" + chart_width / 2 + "," + chart_height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                    .style("stroke-width", 1.5 / k + "px");

                    var country = d.properties.name;
                   //new Country(d.properties.name, d.properties.description).displayCountry();
                    
                    var node = document.createElement('p');
                    node.setAttribute('id', 'closeTab')
                    var textnode = document.createTextNode('x');
                    node.appendChild(textnode);
                    
                    infoBox.text('hi')
                    .style("opacity", 1)
                    ;

                    if(country) {
                        // tooltip.html(new Country(d.properties.name, d.properties.description).displayCountry())
                        //     .style("left", (d3.event.pageX + 8) + "px")   
                        //     .style("top", (d3.event.pageY - 120) + "px");
                        
                        console.log('this ran');
                        infoBox.html(new Country(d.properties.name, d.properties.description).displayCountry()) 
                            .style("left", (d3.event.pageX + 8) + "px")   
                            .style("top", (d3.event.pageY - 120) + "px")
                            .transition()
                            .duration(300);
    
                        // tooltip.transition()
                        //     .duration(0)
                        //     .style('display', 'block')
                        //     .style('opacity', 1)
                        
                        document.querySelector('.infoBox').appendChild(node);

                        // document.querySelector('.tooltip').appendChild(node);
                        document.querySelector('#closeTab').addEventListener('click', function() {
                            close('.infoBox');
                        })                     
    
                    } else {
                        close('.tooltip');  
                    }
    
            });
    
     });
});
