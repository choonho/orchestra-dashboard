// Start of document ready
jQuery(document).ready(function () {
  var portfolio_dic = {};
  var product_dic = {};
  var package_dic = {};
  var version = {};
  var opts = {
    container: 'epiceditor',
    textarea: null,
    basePath: 'epiceditor',
    clientSideStorage: true,
    localStorageName: 'epiceditor',
    useNativeFullscreen: true,
    parser: marked,
    file: {
      name: 'epiceditor',
      defaultContent: '',
      autoSave: 100
    },
    theme: {
      base: '../../../plugins/epiceditor/epiceditor.css',
      preview: '../../../plugins/epiceditor/github.css',
      editor: '../../../plugins/epiceditor/epic-dark.css'
    },
    button: {
      preview: true,
      fullscreen: true,
      bar: "auto"
    },
    focusOnLoad: false,
    shortcut: {
      modifier: 18,
      fullscreen: 70,
      preview: 80
    },
    string: {
      togglePreview: 'Toggle Preview Mode',
      toggleEdit: 'Toggle Edit Mode',
      toggleFullscreen: 'Enter Fullscreen'
    },
    autogrow: true
  }
  var editor = new EpicEditor(opts).load();

  function OpenPopupCenter(pageURL, title, w, h) {
    var left = (screen.width - w) / 2;
    var top = (screen.height - h) / 4;  // for 25% - devide by 4  |  for 33% - devide by 3
    var targetWin = window.open(pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }

  function getTree() {
    var tree = [];
    $.ajax({
        url : '/api/v1/catalog/portfolios',
        async: false,
        headers: {
            'X-Auth-Token' : token
        },
        contentType: 'application/json',
        type: 'GET',
        success: function(data) {
            for(i = 0; i < data.total_count; i++) {
                var tree2 = [];
                $.ajax({
                    url : '/api/v1/catalog/products?portfolio_id='.concat(data.results[i].portfolio_id),
                    async: false,
                    headers: {'X-Auth-Token':token},
                    contentType: 'application/json',
                    type: 'GET',
                    success: function(data) {
                        // add product
                        console.log(data);
                        for(j = 0; j < data.total_count; j++) {
                            tree2.push({text:data.results[j].name});
                            product_dic[data.results[j].name] = data.results[j].product_id;
                        }
                    }
                });
                portfolio_dic[data.results[i].name] = data.results[i].portfolio_id;
                tree.push({text:data.results[i].name,state: {expanded:false},  nodes: tree2});
            }
        }
    });
    return tree;
  };

  $(document).on('click', '#package_version li a', function() {
      var selText = $(this).text();
      console.log(selText);
      $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="ace-icon fa fa-caret-down icon-only"></span>');


      // Show description (README.md)
      $('#epiceditor_container div').remove();
      $('</div><div class="col-xs-8" id="epiceditor"></div>').appendTo('#epiceditor_container');

      var template = package_dic[selText].template;
      var desc_url = package_dic[selText].description;
      $.ajax({
          url: desc_url,
          type: 'GET',
          success: function(data) {
              // Markdown
              editor.importFile('/tmp/workspace.md',data);
              editor.preview();
              $("html, body").animate({ scrollTop: 0 }, "slow");
          }
      });

      // Deploy Stack
      $( "#deploy-btn" ).click(function() {
          var p_id = package_dic[selText].package_id;
          OpenPopupCenter('deploy_stack.html?package_id='.concat(p_id), 'Workflow' , 800, 800);
      });



  });


    $('#tree').treeview({
    showTags: true,
    data: getTree(),
    onNodeSelected: function(event, data) {
            console.log(data);
            if (data.hasOwnProperty('parentId') == true) {
                console.log("product")
                $($("#myTab").find("li")[1]).show();
                $.ajax({
                    url: '/api/v1/catalog/products/'.concat(product_dic[data.text]),
                    headers: {'X-Auth-Token': token},
                    contentType: 'application/json',
                    type: 'GET',
                    success: function(data) {
                        $("#dt-list dt").remove();
                        $("#dt-list dd").remove();
                        $('<dt>Product Name</dt><dd>' + data.name + '</dd>'
                        + '<dt>Short Description</dt><dd>' + data.short_description + '</dd>'
                        + '<dt>Vendor</dt><dd>' + data.vendor + '</dd>'
                        + '<dt>Provided by</dt><dd>' + data.provided_by + '</dd>'
                        + '<dt>Created</dt><dd>' + data.created + '</dd>'
                        ).appendTo('#dt-list');

                        $("#package_version li").remove();
                        package_dic = {};

                        // Call Packages
                        $.ajax({
                            url: '/api/v1/catalog/packages?product_id='.concat(data.product_id),
                            headers: {'X-Auth-Token': token},
                            contentType: 'application/json',
                            type: 'GET',
                            success: function(data) {
                                console.log(data);
                                $('#num_pkgs').text(data.total_count);
                                for( i = 0; i < data.total_count; i++) {
                                  package_dic[data.results[i].version] = data.results[i];
                                  version[data.results[i].version] = data.results[i].template;
                                  $('<li><a href="#">' + data.results[i].version + '</a></li>').appendTo('#package_version');
                                }
                            }
                        });
                    }
                });
            } else {
                console.log("portfolio");
                $($("#myTab").find("li")[1]).hide();
                $('#num_pkgs').text("");
                $.ajax({
                    url: '/api/v1/catalog/portfolios/'.concat(portfolio_dic[data.text]),
                    headers: {'X-Auth-Token': token},
                    contentType: 'application/json',
                    type: 'GET',
                    success: function(data) {
                        $("#dt-list dt").remove();
                        $("#dt-list dd").remove();
                        $('<dt>Portfolio Name</dt><dd>' + data.name + '</dd>'
                        + '<dt>Owner</dt><dd>' + data.owner + '</dd>'
                        + '<dt>Description</dt><dd>' + data.description + '</dd>'
                        + '<dt>Created</dt><dd>' + data.created + '</dd>'
                        ).appendTo('#dt-list');
                    }
                });
            }       
     
        }
  });

});

