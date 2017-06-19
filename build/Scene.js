
window.addEventListener('load', onLoad);

function onLoad() {

  // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
  // Only enable it if you actually need to.
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);

  // Append the canvas element created by the renderer to document body element.
  document.body.appendChild(renderer.domElement);

  // Create a three.js scene.
  scene = new THREE.Scene();

  // Create a three.js camera.
  var aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);

  //Init VR Controls at floor
  controls = new THREE.VRControls(camera);
  controls.standing = true;
  controls.userHeight = -30;
  camera.position.set(0, controls.userHeight, 0);
  controls.update();

  // Apply VR stereo rendering to renderer.
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

  // Create 3D objects.
  //Grab Shaders
  var vertex = document.getElementById('vertexShader').innerHTML;
  var fragment = document.getElementById('fragmentShader').innerHTML;
  //Atmosphere (sky) uniforms:
  uniforms = {
      u_time: { type: "f", value: 1.0 },
      u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
      u_mouse: { type: "v2", value: new THREE.Vector2() },
      u_tint: {type: "v3", value: new THREE.Vector3(.2,.3,.9)},
      u_atmosphere: { type: "f", value: 1.0 }, 
  };

  var skyMaterial = //new THREE.MeshBasicMaterial( {color: new THREE.Color( 0x8800ff ),side:THREE.DoubleSide} );
  new THREE.ShaderMaterial({
              uniforms: uniforms,
              vertexShader: document.getElementById( 'vertexShader' ).textContent,
              fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
                side: THREE.DoubleSide
        });
  skyMaterial.needsUpdate = true;
  var skyGeometry = new THREE.IcosahedronBufferGeometry(1000, 0)
  skyGeometry.phiLength = Math.PI/2;
  skyMesh = new THREE.Mesh( skyGeometry, skyMaterial);
  scene.add(skyMesh);

  window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', function(){
    onResize();
    if(!sound.isPlaying){
        sound.play();
        playAssets();
        startedSoundTime = sound.context.currentTime;
    }
  }, true);

  initUI();
  setupStage();
  loadAudio();
  loadModels();

  var floorGroup = buildFloor();
  scene.add(floorGroup);
}

// Request animation frame loop function
function animate(timestamp) {
  if(sound.isPlaying){
    //console.log(sound.context.currentTime-startedSoundTime);
    if(controls.userHeight < 0)
      controls.userHeight += .02;
    //controls.update();
  }
   uniforms.u_time.value += .01;

  frameNum++;
  
  //floorControls.particleTarget.x += (noise.perlin2(floorControls.particleTarget.x, frameNum*.001))*50;
  //floorControls.particleTarget.y += (noise.perlin2(floorControls.particleTarget.y, 100+frameNum*.001))*50;
  //floorControls.particleTarget.z += (noise.perlin2(floorControls.particleTarget.z, 200+frameNum*.001))*50;

  //console.log(noise.perlin2(1, 10))
  uniforms.u_time.value += .01;
  
  skyMesh.material.needsUpdate = true; 
  if(frameNum%3 === 0){
    animateFloor();
  }
  

  var delta = Math.min(timestamp - lastRenderTime, 500);
  lastRenderTime = timestamp;

  // Only update controls if we're presenting.
  if (vrButton.isPresenting()) {
    controls.update();
    analyser.getFrequencyData();
  }
  // Render the scene.
  effect.render(scene, camera);
  
  vrDisplay.requestAnimationFrame(animate);
}

function onResize(e) {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  uniforms.u_resolution.value = new THREE.Vector2( window.innerHeight, window.innerWidth );
}

// if (document.addEventListener)
// {
//     document.addEventListener('webkitfullscreenchange', exitHandler, false);
//     document.addEventListener('mozfullscreenchange', exitHandler, false);
//     document.addEventListener('fullscreenchange', exitHandler, false);
//     document.addEventListener('MSFullscreenChange', exitHandler, false);
// }

// function exitHandler()
// {
//     if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement !== null)
//     {
//         console.log('exit fs')
//         sound.stop();
//     }
// }
function velocityToTarget(pos,target,speed){
      var dir_to_target = pos.sub(target);
      dir_to_target.normalize();
      dir_to_target.multiplyScalar ( -1*speed);
      return dir_to_target
}

function lerp(start, end, percent)
{
     return (start + percent*(end - start));
}