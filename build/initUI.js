function initUI(){
// Initialize the WebVR UI.
  var uiOptions = {
    color: 'black',
    background: 'white',
    corners: 'square'
  };
  vrButton = new webvrui.EnterVRButton(renderer.domElement, uiOptions);
  vrButton.on('exit', function() {
    camera.quaternion.set(0, 0, 0, 1);
    camera.position.set(0, controls.userHeight, 0);
  });
  vrButton.on('hide', function() {
    document.getElementById('ui').style.display = 'none';

  });
  vrButton.on('show', function() {
    //document.getElementById('ui').style.display = 'inherit';
  });
  document.getElementById('vr-button').appendChild(vrButton.domElement);
  document.getElementById('vr-button').addEventListener('click', function(){
    //initDaydream();

        // if(!sound.isPlaying){
        //   sound.play();
        //   playAssets();
        //   startedSoundTime = sound.context.currentTime;
        // }
    
  });

  document.getElementById('magic-window').addEventListener('click', function() {
    vrButton.requestEnterFullscreen();
   // initDesktop();

        if(!sound.isPlaying){
          sound.play();
          playAssets();
          startedSoundTime = sound.context.currentTime;
        }

    //initDaydream();
  });
}