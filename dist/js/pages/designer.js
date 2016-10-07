// Start of document ready
jQuery(document).ready(function () {
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

});

