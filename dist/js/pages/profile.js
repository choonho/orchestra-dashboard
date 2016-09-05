// Start of document ready
jQuery(document).ready(function () {
  var form_actions = {'Add AWS Account':'#form-aws',
    'Add OpenStack Account':'#form-openstack',
    'Add Baremetal Account':'#form-baremetal',
    'Add Keypair':'#form-keypair'};

  // Action Menu
  for(var key in form_actions) {
    $('<li><a href="#">' + key + '</a></li>').appendTo('#action-account');
  };

  $(document).on('click', '#action-account li a', function() {
    var selText = $(this).text();
    $(form_actions[selText]).modal('show');
  });

  // Modal Close
  $('#aws-close').click(function() {
    $('#form-aws').modal('hide');
  });
  $('#openstack-close').click(function() {
    $('#form-openstack').modal('hide');
  });
  $('#joyent-close').click(function() {
    $('#form-joyent').modal('hide');
  });
  $('#keypair-close').click(function() {
    $('#form-keypair').modal('hide');
  });

  $.ajax({
    url: '/api/v1/users/'.concat(user_id).concat('/detail'),
    headers: {'X-Auth-token':token},
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify({list:'all'}),
    success: function(data) {
      console.log(data);
      var auth_list = [];
      for(i = 0; i < data.total_count; i++) {
        auth_list.push([data.results[i].platform, data.results[i].auth]);
      }
      var table = $('#identityTable').DataTable({
                    data: auth_list,
                    'authWidth':true});
    }
  });

  // Modal Save
  $('#aws-save').click(function() {
    var ak = $('#aws-ak').val();
    var sa = $('#aws-sa').val();
    console.log(user_id);
    $.ajax({
      url: '/api/v1/users/'.concat(user_id).concat('/detail'),
      headers: {'X-Auth-token':token},
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify({add:{access_key_id:ak, secret_access_key: sa},platform:'aws'}),
      success: function(data) {
          console.log(data);
          $('#form-aws').modal('hide');
      }
    })
  });



  $('#joyent-save').click(function() {
    var ki = $('#joyent-ki').val();
    var sc = $('#joyent-rsa').val();
    console.log(user_id);
    console.log(sc);
    $.ajax({
      url: '/api/v1/users/'.concat(user_id).concat('/detail'),
      headers: {'X-Auth-token':token},
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify({add:{key_id:ki, secret_content: sc},platform:'joyent'}),
      success: function(data) {
          console.log(data);
          $('#form-joyent').modal('hide');
      }
    })
  });

  $('#keypair-save').click(function() {
    var k = $('#key-name').val();
    var v = $('#key-rsa').val();
    console.log(user_id);
    $.ajax({
      url: '/api/v1/users/'.concat(user_id).concat('/keypair'),
      headers: {'X-Auth-token':token},
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify({add:{'name':k, 'key_type':'id_rsa', 'value':v}}),
      success: function(data) {
          console.log(data);
          $('#form-keypair').modal('hide');
      }
    })
  });

  function getEvents() {
    $.ajax({
      url: '/api/v1/events',
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


  getEvents();
});

