var csrftoken;

function ScormXBlock_${block_id}(runtime, element) {

  function SCORM_API(){

    this.LMSInitialize = function(){
      console.log('LMSInitialize');
      return true;
    };

    this.LMSFinish = function() {
      console.log("LMSFinish");
      return "true";
    };

    this.LMSGetValue = function(cmi_element) {
      console.log("Getvalue for " + cmi_element);
      var handlerUrl = runtime.handlerUrl(element, 'scorm_get_value');

      var response = $.ajax({
        type: "POST",
        url: handlerUrl,
        data: JSON.stringify({'name': cmi_element}),
        async: false
      });
      response = JSON.parse(response.responseText);
      return response.value
    };

    this.LMSSetValue = function(cmi_element, value) {
      console.log("LMSSetValue " + cmi_element + " = " + value);
      var handlerUrl = runtime.handlerUrl( element, 'scorm_set_value');

      if (cmi_element == 'cmi.core.lesson_status'||cmi_element == 'cmi.core.score.raw'){

        $.ajax({
          type: "POST",
          url: handlerUrl,
          data: JSON.stringify({'name': cmi_element, 'value': value}),
          async: false,
          success: function(response){
            if (typeof response.lesson_score != "undefined"){
              $(".lesson_score", element).html(response.lesson_score);
            }
          }
        });

      }
      return true;
    };

    /*
    TODO: this is all racoongang stubs
    this.LMSCommit = function() {
        console.log("LMSCommit");
        return "true";
    };

    this.LMSGetLastError = function() {
      console.log("GetLastError");
      return "0";
    };

    this.LMSGetErrorString = function(errorCode) {
      console.log("LMSGetErrorString");
      return "Some Error";
    };

    this.LMSGetDiagnostic = function(errorCode) {
      console.log("LMSGetDiagnostic");
      return "Some Diagnostice";
    }
    */

  }

  $(function ($) {
    API = new SCORM_API();
    console.log("Initial SCORM data...");

    const beforeUnloadListener = (event) => {
      // since to assign this directly to playerWin w/o being able to use addEventListener,
      // means we can't capture, we don't know if player may actually try to close its popup window while this is firing
      try {
        if (event.currentTarget.frames.length > 0) {  // host iframe has opened popups
          event.preventDefault();
          // the below is mostly unsupported by browsers so we will probably get the default confirmation dialog
          return event.returnValue = "Leaving this page while the module popup is open can result in losing current or further progress in the module.";
        }
      }
      catch (e) {
        if (e instanceof TypeError) {
          return;
        }
      }
    };

    const winBeforeUnloadListener = (event) => {
        event.preventDefault();
        return False;
    }

    window.onbeforeunload = winBeforeUnloadListener;

    //post message with data to player frame
    //player must be in an iframe and not a popup due to limitations in Internet Explorer's postMessage implementation
    launch_btn_${block_id} = $('#scorm-launch-${block_id}');
    host_frame_${block_id} = $('#scormxblock-${block_id}');
    host_frame_${block_id}.data('csrftoken', $.cookie('csrftoken'));
    display_type = host_frame_${block_id}.data('display_type');

    launch_btn_${block_id}.on('click', function() {
      playerWin = null;
      if (display_type == 'iframe') {
        host_frame_${block_id}.css('height', host_frame_${block_id}.data('display_height') + 'px');
      }
      $(host_frame_${block_id}).on('load', function() {
        playerWin = host_frame_${block_id}[0].contentWindow;
        hostWin = window;
        playerWin.postMessage(host_frame_${block_id}.data(), '*');
        launch_btn_${block_id}.attr('disabled','true');

        playerWin.onbeforeunload = beforeUnloadListener; // addEventListener doesn't work here, cross-browser
        if (playerWin.hasOwnProperty('ssla')) {
            playerWin.ssla.ssla.scorm.events.postFinish.add(function() {
                hostWin.onbeforeunload = null;
                launch_btn_${block_id}.removeAttr('disabled');
            });
        }
      });
      host_frame_${block_id}.attr('src',host_frame_${block_id}.data('player_url'));
    });
      

    });    

  });
}
