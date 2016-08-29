// Start of document ready
jQuery(document).ready(function () {
  var region_dic = {};
  var zone_dic = {};
  var server_dic = {};
  var server_table = {};
  var project_list = [];
  var action_project = {'Start Project':'#action-start',
                    'Stop Project':'#action-stop',
                    'Delete Project':'#delete-project'}
  var temp_name;
  var temp_id;
  var table;
  var selected_nodes = [];
  var selected_zone;


  for (var action in action_project) {
    $('<li><a href="#">' + action + '</a></li>').appendTo('#action-project');
  }

  function updateTable(server_list) {
    console.log(server_list);
    table = $('#projectTable').DataTable({
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

  function listProjects() {
      $.ajax({
          url : '/api/v1/catalog/stacks?detail',
          headers: {
              'X-Auth-Token' : token
          },
          contentType: 'application/json',
          type: 'GET',
          success: function(data) {
            console.log(data);
            var project_list = [];
            for( i = 0; i < data.total_count; i++) {
                var p1 = data.results[i].detail.portfolio.name;
                var p2 = data.results[i].detail.product.name;
                var p3 = data.results[i].detail.package.version;
                var pkg = "";
                pkg = pkg.concat(p1," > ", p2, " > ", p3);
                var num_s = data.results[i].detail.servers.length;
                project_list.push([null, data.results[i].name, data.results[i].stack_id, pkg,
                    num_s,"b",
                    data.results[i].state
                ]);
            }
            updateTable(project_list);
          }
      }); 
  return project_list;
  } // End of listProjects

  function deleteStacks(nodes) {
    console.log(nodes);
    for(var i in nodes) {
      console.log("delete stacks:".concat(nodes[i]));
      $.ajax({
          url : '/api/v1/catalog/stacks/'.concat(nodes[i]),
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

  $(document).on('click', '#action-project li a', function() {
    var selText = $(this).text();
    console.log(selText);
    $(action_project[selText]).modal('show');
    selected_nodes = listSelectedTable();
    console.log(selected_nodes);
  });

  $('#btn-del-project').click(function() {
    deleteStacks(selected_nodes);
    selected_nodes = [];
    $('#delete-project').modal('hide');
    listStacks(selected_zone);
    updateTable(project_list);
  });


  listProjects();
});

