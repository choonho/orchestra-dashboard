// Start of document ready
jQuery(document).ready(function () {

  $('#draggable').draggable();
  // Epic Editor
  var opts = {
    container: 'epiceditor',
    textarea: null,
    basePath: 'epiceditor',
    clientSideStorage: true,
    localStorageName: 'epiceditor',
    useNativeFullscreen: true,
    autogrow: true,
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
  var data = 
`## Describe Task   
## Environment                  
Key | Value | Description
----|----   | ----
key1| value1  | This is for key1

## Detailed Task

### Sub Task 1

~~~bash
apt-get -y install some packages
~~~

### Sub Task 2

edit /path/subpath2

~~~text
update configuration
~~~
`;
  editor.importFile('/tmp/sample_task.md',data);
  editor.preview();



  var BpmnModeler = window.BpmnJS;
  // create modeler
  var bpmnModeler = new BpmnModeler({
    container: '#canvas',
    height:700
  });


  // import function
  function importXML(bpmn_xml) {
    $.ajax({
      url: bpmn_xml,
      type: 'GET',
      success: function(xml) {
        // import diagram
        bpmnModeler.importXML(xml, function(err) {

          if (err) {
            return console.error('could not import BPMN 2.0 diagram', err);
          }

          var canvas = bpmnModeler.get('canvas');

          // zoom to fit full viewport
          canvas.zoom('fit-viewport');
        });
        }
    });

    // save diagram on button click
    var saveButton = document.querySelector('#create-workflow');

    saveButton.addEventListener('click', function() {

      // get the diagram contents
      bpmnModeler.saveXML({ format: true }, function(err, xml) {

        if (err) {
          console.error('diagram save failed', err);
        } else {
          console.info('diagram saved');
          console.info(xml);
        }

        alert('diagram saved (see console (F12))');
      });
    });
  }


  // a diagram to display
  //
  // see index-async.js on how to load the diagram asynchronously from a url.
  // (requires a running webserver)

  // import xml
  diagramXML = 'https://raw.githubusercontent.com/bocabaton/orchestra-books/master/test/workflow.bpmn';
  importXML(diagramXML);

  $('#close').click(function() {
    $('#draggable').hide();
  });

  $('#saveTask').click(function() {
    $('#draggable').hide();
  });


});

