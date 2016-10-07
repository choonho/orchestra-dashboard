// Start of document ready
jQuery(document).ready(function () {
  var region_dic = {};
  var zone_dic = {};
  var server_dic = {};
  var server_table = {};
  var server_list = [];
  var region_actions = ['Add Zone', 'Update Zone', 'Delete Zone'];
  var zone_actions = ['Add Zone Property', 'Update Zone Property', 'Delete Zone Property']
  var action_dic = {'Add Zone Property':'#zone-property',
                    'Discover Resources':'#discover-regions'}
  var action_servers = { 'Start Servers':'A',
                        'Stop Servers': 'B',
                        'Delete Servers': '#delete-servers'
                      }
  var temp_name;
  var temp_id;
  var table;
  var selected_nodes = [];
  var selected_zone;

  $($("#myTab").find("li")[1]).hide();

  for (var action in action_servers) {
    $('<li><a href="#">' + action + '</a></li>').appendTo('#action-servers');
  }

  function updateTable(server_list) {
    console.log(server_list);
    table = $('#instanceTable').DataTable({
      'columnDefs': [{
        'targets': 0,
        'searchable':false,
        'orderable':false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta){
           return '<input type="checkbox" class="server" value="' + full[2] + '">';
         }
       }],
      'order': [1, 'asc'],
      destroy:true,
      'autoWidth':true,
      data:server_list});

   // Handle click on "Select all" control
   $('#server-select-all').on('click', function(){
      // Check/uncheck all checkboxes in the table
      console.log("select all");
      var rows = table.rows({ 'search': 'applied' }).nodes();
      $('input[type="checkbox"]', rows).prop('checked', this.checked);
   });

   // Handle click on checkbox to set state of "Select all" control
   $('#instanceTable tbody').on('change', 'input[type="checkbox"]', function(){
      // If checkbox is not checked
      if(!this.checked){
         var el = $('#server-select-all').get(0);
         // If "Select all" control is checked and has 'indeterminate' property
         if(el && el.checked && ('indeterminate' in el)){
            // Set visual state of "Select all" control 
            // as 'indeterminate'
            el.indeterminate = true;
         }
      }
   });

  } // End of updateTable

  function listSelectedTable() {
    var remove_list = [];
    table.$('input[type="checkbox"]').each(function(){
       // If checkbox doesn't exist in DOM
       if($.contains(document, this)){
          // If checkbox is checked
          if(this.checked){
            console.log(this.value);
            remove_list.push(this.value);
          }
       } 
    });
    return remove_list;
  } // End of listSelectedTable

  function listServers(zone_id) {
      $.ajax({
          url : '/api/v1/provisioning/servers?zone_id='.concat(zone_id).concat('&brief=true'),
          headers: {
              'X-Auth-Token' : token
          },
          contentType: 'application/json',
          type: 'GET',
          success: function(data) {
            console.log(data);
            server_list = [];
            $('#num_servers').text(data.total_count);
            for( i = 0; i < data.total_count; i++) {
                server_list.push([null, data.results[i].name, data.results[i].server_id,
                  data.results[i].brief['private_ip'],data.results[i].brief['public_ip'],
                  data.results[i].brief['login_id'],data.results[i].brief['server_id'],
                  data.results[i].brief['stack_name'],data.results[i].status
                ]);
            }
          }
      }); 
  return server_list; 
  } // End of listServers

  function deleteServers(nodes) {
    console.log(nodes);
    for(var i in nodes) {
      console.log("delete server:".concat(nodes[i]));
      $.ajax({
          url : '/api/v1/provisioning/servers/'.concat(nodes[i]),
          headers: {
              'X-Auth-Token' : token
          },
          contentType: 'application/json',
          type: 'DELETE',
          success: function(data) {
            console.log(data);
          }
      }); 
   
    }
  } // End of deleteServers

  function getTree() {
    // Some logic to retrieve, or generate tree structure
    var tree = [];
    $.ajax({
        url : '/api/v1/provisioning/regions?brief=true',
        async: false,
        headers: {
            'X-Auth-Token' : token
        },
        contentType: 'application/json',
        type: 'GET',
        success: function(data) {
            //if (data.total_count == 0) {
            //  console.log('wizard');
            //  $('#discover-regions').modal('show');
            //}
            for(i = 0; i < data.total_count; i++) {
                var tree2 = [];
                $.ajax({
                    url : '/api/v1/provisioning/zones?region_id='.concat(data.results[i].region_id),
                    async: false,
                    headers: {'X-Auth-Token':token},
                    contentType: 'application/json',
                    type: 'GET',
                    success: function(data) {
                        // add zones
                        for(j = 0; j < data.total_count; j++) {
                            tree2.push({text:data.results[j].name, tags:[data.results[j].zone_type]});
                            zone_dic[data.results[j].name] = data.results[j].zone_id;
                        }
                    }
                });
                region_dic[data.results[i].name] = data.results[i].region_id;
                tree.push({text:data.results[i].name,state: {expanded:false},  nodes: tree2});
            }
        }
    }); 
    return tree;
    };

  $('#tree').treeview({
    showTags: true,
    data: getTree(),
    onNodeSelected: function(event, data) {
            console.log(data);
            if (data.hasOwnProperty('parentId') == true) {
                console.log("zones")
                //Action Button of Zone
                $('#action-resource li').remove();
                for (i = 0; i < zone_actions.length; i++) {
                  $('<li><a href="#">' + zone_actions[i] + '</a></li>').appendTo('#action-resource');
                }

                $($("#myTab").find("li")[1]).show();
                $.ajax({
                    url: '/api/v1/provisioning/zones/'.concat(zone_dic[data.text]),
                    headers: {'X-Auth-Token': token},
                    contentType: 'application/json',
                    type: 'GET',
                    success: function(data) {
                        $("#dt-list dt").remove();
                        $("#dt-list dd").remove();
                        $('<dt>Zone Name</dt><dd>' + data.name + '</dd>'
                        + '<dt>Platform</dt><dd>' + data.zone_type + '</dd>'
                        + '<dt>Zone ID</dt><dd>' + data.zone_id + '</dd>'
                        ).appendTo('#dt-list');
                        // Call servers
                        selected_zone = data.zone_id
                        $.ajax({
                            url: '/api/v1/provisioning/servers?zone_id='.concat(data.zone_id).concat('&brief=true'),
                            headers: {'X-Auth-Token': token},
                            contentType: 'application/json',
                            type: 'GET',
                            success: function(data) {
                                console.log(data);
                                server_list = [];
                                $('#num_servers').text(data.total_count);
                                for( i = 0; i < data.total_count; i++) {
                                    server_list.push([null, data.results[i].name, data.results[i].server_id,
                                      data.results[i].brief['private_ip'],data.results[i].brief['public_ip'],
                                      data.results[i].brief['login_id'],data.results[i].brief['server_id'],
                                      data.results[i].brief['stack_name'],data.results[i].status
                                    ]);
                                }
                                server_table[data] = server_list;
                                updateTable(server_list);
                            }
                        });
                    }
                });
            } else {
                console.log("regions")
                //Action Button
                $('#action-resource li').remove();
                for (i = 0; i < region_actions.length; i++) {
                  $('<li><a href="#">' + region_actions[i] + '</a></li>').appendTo('#action-resource');
                }
                $('#num_servers').text("");
                $($("#myTab").find("li")[1]).hide();
                $.ajax({
                    url: '/api/v1/provisioning/regions/'.concat(region_dic[data.text]),
                    headers: {'X-Auth-Token': token},
                    contentType: 'application/json',
                    type: 'GET',
                    success: function(data) {
                        $("#dt-list dt").remove();
                        $("#dt-list dd").remove();
                        $('<dt>Region Name</dt><dd>' + data.name + '</dd>'
                        ).appendTo('#dt-list');
                    }
                });
            }       
     
        }
  });



  $(document).on('click', '#action-resource li a', function() {
    var selText = $(this).text();
    console.log(selText);
    $(action_dic[selText]).modal('show');
  });


  $(document).on('click', '#action-servers li a', function() {
    var selText = $(this).text();
    console.log(selText);
    $(action_servers[selText]).modal('show');
    selected_nodes = listSelectedTable();
    console.log(selected_nodes);
  });

  $('#btn-del-servers').click(function() {
    deleteServers(selected_nodes);
    selected_nodes = [];
    $('#delete-servers').modal('hide');
    listServers(selected_zone);
    updateTable(server_list);
  });

  $(document).on('click', '#action-discover-resource li a', function() {
    var selText = $(this).text();
    console.log(selText);
  });

  $('#btn-dis-regions').click(function() {
    var selected_clouds = [];
    if($('#chk-aws').prop("checked") == true) {
      selected_clouds.push('aws');
    }
    if($('#chk-openstack').prop("checked") == true) {
      selected_clouds.push('openstack');
    }
    if($('#chk-joyent').prop("checked") == true) {
      selected_clouds.push('joyent');
    }
    console.log(selected_clouds);
    for(var i in selected_clouds) {
      $.ajax({
        url: '/api/v1/provisioning/discover',
        headers: {'X-Auth-Token': token},
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify({discover:{type:selected_clouds[i]}}),
        success: function(data) {
          console.log(data);
          setTimeout($('#discover-regions').modal('hide'), 5000);
        }
      });
    }
  });


  
  $('#discover-close').click(function() {
    $('#discover-regions').modal('hide');
  });


});

