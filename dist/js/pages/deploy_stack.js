// Start of document ready
jQuery(document).ready(function () {
  var zone_dic = {}

    var contentType ="application/x-www-form-urlencoded; charset=utf-8";
 
    if(window.XDomainRequest)
        contentType = "text/plain";


    //$('#stackDeploy').modal('modal-body').css({'height': '600px'})
    // TODO: clean before create
    $("#bpmn_container div").remove();
    $('<div id="bpmn"></div>').appendTo('#bpmn_container');
    // BPMN

    package_id= url('?package_id');
    var stack_id;

    console.log(package_id);
    
    var BpmnViewer = window.BpmnJS;
    var viewer = new BpmnViewer({ container: $('#bpmn'), height: 500 });

    function openFromUrl(bpmn_url) {
    $.ajax({
        url: bpmn_url,
        type: 'GET',
        success: function(xml) {
            // BPMN
                viewer.importXML(xml, function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        viewer.get('canvas').zoom('fit-viewport');
                    }
                })
        }
    });
    }

   
    var bpmn_url;
    $.ajax({
        type: "GET",
        async: false,
        headers: {'X-Auth-Token':token},
        url: "/api/v1/catalog/packages/".concat(package_id),
        contentType: "application/json",
        success: function(resultData) {
            bpmn_url = resultData.template;
            console.log(bpmn_url);
            var pkg_type = resultData.pkg_type;
            openFromUrl(bpmn_url);
        },
    });
 
   

// Stack environment
var tag_input = $('#form-field-tags');
try{
    tag_input.tag(
      {
        placeholder:tag_input.attr('placeholder'),
        //enable typeahead by specifying the source array
        source: ace.vars['US_STATES'],//defined in ace.js >> ace.enable_search_ahead
        /**
        //or fetch data from database, fetch those that match "query"
        source: function(query, process) {
          $.ajax({url: 'remote_source.php?q='+encodeURIComponent(query)})
          .done(function(result_items){
            process(result_items);
          });
        }
        */
      }
    )

    //programmatically add a new
    var $tag_obj = $('#form-field-tags').data('tag');
    $tag_obj.add('key1=value1');
}
catch(e) {
    //display a textarea for old IE, because it doesn't support this plugin or another one I tried!
    tag_input.after('<textarea id="'+tag_input.attr('id')+'" name="'+tag_input.attr('name')+'" rows="3">'+tag_input.val()+'</textarea>').remove();
    //$('#form-field-tags').autosize({append: "\n"});
}


// Launch Stack
$( "#launch-btn" ).click(function() {
    var env = $("#jeju-env").tagsinput("items");
    console.log(env);
    var env2 = {}
    for (var i in env) {
        var res = env[i].split("=");
        env2[res[0]] = res[1];
    }
    var name = $("#project_name").val();
    var zone_id = zone_dic[$("zone_list option:selected").val()];
    env2['COMPOSE_PROJECT_NAME'] = name;
    env2['ZONE_ID'] = zone_id;
    env2['TOKEN'] = token;
    $.ajax({
        type: "POST",
        headers: {'X-Auth-Token':token},
        url: "/api/v1/catalog/stacks",
        data: JSON.stringify({package_id: package_id, name: name, env: {jeju: env2, compose: env2}}),
        contentType: "application/json",
        success: function(resultData) {
            console.log(resultData);
            stack_id = resultData.stack_id;
            setInterval(checkState, 10000);
        },
    });

});


function markNodeColor(workflow_state) {
    $.ajax({
        url: bpmn_url,
        type: 'GET',
        dataType: 'xml',
        success: function(data) {
            // Parse XML
            var xml_node = $('bpmn\\:process, process', data);
            console.log(data);
            console.log(xml_node);
            var nodes = xml_node.find('bpmn\\:serviceTask, serviceTask');
            console.log(nodes);
            for (var key in workflow_state) {
                console.log(key);
                var state = workflow_state[key];
                console.log(state);
                if (state == 'running') {
                    // mark running color
                    console.log(nodes.length);
                    for (i = 0; i < nodes.length; i++) {
                        console.log(nodes[i].attributes[1])
                        console.log(key)
                        if (nodes[i].attributes[1].nodeValue == key) {
                          viewer.get('canvas').addMarker(nodes[i].id, 'running1');
                        }
                    }
                }
                else if (state == 'complete') {
                    // mark running color
                    console.log(nodes.length);
                    for (i = 0; i < nodes.length; i++) {
                        console.log(nodes[i].attributes[1])
                        console.log(key)
                        if (nodes[i].attributes[1].nodeValue == key) {
                            viewer.get('canvas').addMarker(nodes[i].id, 'complete');
                        }
                    }
                }


            }
        }
    });
}


// State loop
function checkState() {
    $.ajax({
        type: "POST",
        headers: {'X-Auth-Token':token},
        url: '/api/v1/catalog/stacks/'.concat(stack_id).concat('/env'),
        data: JSON.stringify({'get':'workflow_state'}),
        contentType: 'application/json',
        success: function(resultData) {
            console.log(resultData);
            markNodeColor(resultData);
        }
    });
}

function listZones() {
    $.ajax({
        type: "GET",
        headers: {'X-Auth-Token':token},
        url: '/api/v1/provisioning/zones',
        contentType: 'application/json',
        success: function(result) {
          console.log(result);
          var opt_str="";
          for(var i in result.results) {
            zone_dic[result.results[i].name] = result.results[i].zone_id;
            opt_str = opt_str.concat("<option>").concat(result.results[i].name).concat("</option>");
          }
          // Update zone_list
          $('#zone_list').html(opt_str);
          console.log(opt_str);
        }
    });
}


listZones()

});

