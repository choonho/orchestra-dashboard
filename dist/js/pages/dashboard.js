// Start of document ready
jQuery(document).ready(function () {
  var latLng = {
    'eu-ams-1': [52.37, 4.89],
    'us-east-1':[37.43, -78.65],
    'us-east-2':[40.41, -82.90],
    'us-east-3':[45.50, -73.56],
    'us-sw-1':[38.80, -116.41],
    'us-west-1':[37.77, -119.41],
    'ap-northeast-1':[35.70,139.73],
    'ap-northeast-2':[37.56, 126.97],
    'sa-east-1':[-23.55, -46.63],
    'ap-southeast-1':[1.35, 103.81],
    'ap-southeast-2':[-33.86, 151.20],
    'us-west-2':[43.80, -120.55],
    'ap-south-1':[19.07, 72.87],
    'eu-central-1':[50.11, 8.68],
    'eu-west-1':[53.41, -8.24]
  };

  var total_servers=0;
  var total_stacks;

  function getRegions() {
    var markers = [];
    var series = [];

    $.ajax({
      url: '/api/v1/provisioning/regions?brief=true',
      headers: {
        'X-Auth-Token': token
      },
      contentType: 'application/json',
      type: 'GET',
      success: function(data) {
        for(i=0; i < data.total_count; i++) {
          if (data.results[i].brief['total_servers'] > 0) {
            markers.push({latLng: latLng[data.results[i].name], name: data.results[i].name});
            series.push(data.results[i].brief['total_servers']);
            total_servers = total_servers + data.results[i].brief['total_servers'];
          }
        }

        $('#num_servers').text(total_servers);
        console.log(total_servers);

   /* jVector Maps
   * ------------
   * Create a world map with markers
   */
    $('#world-map-markers').vectorMap({
    map: 'world_mill_en',
    normalizeFunction: 'polynomial',
    hoverOpacity: 0.7,
    hoverColor: false,
    backgroundColor: 'transparent',
    regionStyle: {
      initial: {
        fill: 'rgba(210, 214, 222, 1)',
        "fill-opacity": 1,
        stroke: 'none',
        "stroke-width": 0,
        "stroke-opacity": 1
      },
      hover: {
        "fill-opacity": 0.7,
        cursor: 'pointer'
      },
      selected: {
        fill: 'yellow'
      },
      selectedHover: {}
    },
    markerStyle: {
      initial: {
        fill: '#00a65a',
        stroke: '#111'
      }
    },
    markers: markers,
    series: {
      markers:[{
        attribute: 'r',
        scale: [5,10],
        values: series
        }]
    }
    });



      }
    });



  };


  function getStacks() {

    $.ajax({
      url: '/api/v1/catalog/stacks?state=running',
      headers: {
        'X-Auth-Token': token
      },
      contentType: 'application/json',
      type: 'GET',
      success: function(data) {
        console.log(data);
        $('#num_stacks').text(data.total_count);
      }
    });
  }; 

  function getEvents() {
    $.ajax({
      url: '/api/v1/events?limit=5',
      headers: {
        'X-Auth-Token': token
      },
      contentType: 'application/json',
      type: 'GET',
      success: function(data) {
        console.log(data);
        // Sort based on date
        var events = {}
        for(var i in data.results) {
          var d = data.results[i].created.split(" ");
          var item = [data.results[i].msg_type, d[1], data.results[i].user_id, data.results[i].group_id, data.results[i].msg];
          if (events.hasOwnProperty(d[0]) == true) {
            events[d[0]].push(item);
          } else {
            events[d[0]] = [item];
          }
        }
        console.log(events);
        var a = '';
        var icon = '';
        for(var j in events) {
          a = a + '<ul class="timeline timeline-inverse"><li class="time-label"><span class="bg-red">' + j + '</span></li>';
          for(var l in events[j]) {
            var k = events[j][l];
            console.log(k);
            if (k[0] == "info") {
              icon = 'fa-info-circle';
            } else if (k[0] == "debug") {
              icon = 'fa-bug';
            } else if (k[0] == "warning") {
              icon = 'fa-exclamation-triangle';
            } else {
              icon = "fa-question-circle-o";
            }
            a = a + '<li><i class="fa ' + icon + ' bg-blue"></i><div class="timeline-item"><span class="time"><i class="fa fa-clock-o"></i>' + k[1] + '</span><h3 class="timeline-header"><a href="#">' + k[2] + '</a>' + k[3] + '</h3><div class="timeline-body">' + k[4] + '</div></div></li>';
          }
        a = a + '</ul>';
        }
        console.log(a);
        document.getElementById('timeline').innerHTML = a;
      }
    });


  };

  var r = getRegions();
  var e = getEvents();
  getStacks();

});

