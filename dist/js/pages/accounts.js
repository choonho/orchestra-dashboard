// Start of document ready
$(function () {
  var user_list = [];
  $.ajax({
      url : '/api/v1/users',
      headers: {
          'X-Auth-Token' : token
      },
      contentType: 'application/json',
      type: 'GET',
      success: function(data) {
        console.log(data);
        for(i = 0; i < data.total_count; i++) {
            user_list.push([data.results[i].user_id, data.results[i].name,
              data.results[i].group_id,data.results[i].group_name,
              data.results[i].email,data.results[i].timezone,
              data.results[i].created, data.results[i].state
              ]);
          }
          $('#instanceTable').DataTable({destroy:true, data:user_list});
      }
  });
});

