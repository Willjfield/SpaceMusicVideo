// Last time the scene was rendered.
var lastRenderTime = 0;
// Currently active VRDisplay.
var vrDisplay;
// How big of a box to render.
var boxSize = 5;
// Various global THREE.Objects.
var scene;
var cube;
var controls;
var effect;
var camera;
// EnterVRButton for rendering enter/exit UI.
var vrButton;
var plane;
var uniforms;
var speed = 0;
var analyser;
const planeResolution = 14;
var renderer;
var sound;
var startedSoundTime = 0;
var skyMesh;
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

  controls = new THREE.VRControls(camera);
  controls.standing = true;
  camera.position.y = controls.userHeight;

  // Apply VR stereo rendering to renderer.
  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

  // Add a repeating grid as a skybox.
  var loader = new THREE.TextureLoader();
  loader.load('assets/box.png', onTextureLoaded);

  // Create 3D objects.
  
  var geometry = new THREE.PlaneGeometry( 100, 200, planeResolution, planeResolution*2 );
  var vertex = document.getElementById('vertexShader').innerHTML;
  var fragment = document.getElementById('fragmentShader').innerHTML;
  console.log(fragment)
   uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };
  var skyMaterial = //new THREE.MeshBasicMaterial( {color: new THREE.Color( 0x8800ff ),side:THREE.DoubleSide} );
  new THREE.ShaderMaterial({
              uniforms: uniforms,
              vertexShader: document.getElementById( 'vertexShader' ).textContent,
              fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
                side: THREE.DoubleSide
        });
  skyMaterial.needsUpdate = true;
  var skyGeometry = new THREE.IcosahedronBufferGeometry(1000, 3)
  skyGeometry.phiLength = Math.PI/2;
  //THREE.SphereGeometry( radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength );
  skyMesh = new THREE.Mesh( skyGeometry, skyMaterial);
  scene.add(skyMesh);

  material = new THREE.MeshBasicMaterial( {color: new THREE.Color( 0xff0088 ), wireframe:true} );
  plane = new THREE.Mesh( geometry, material );
  plane.rotation.x = -Math.PI/2;
  plane.position.set(0, -20, -25);

  scene.add(plane);

  window.addEventListener('resize', onResize, true);
  window.addEventListener('vrdisplaypresentchange', onResize, true);

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
    document.getElementById('ui').style.display = 'inherit';
    //initDaydream();
    
    // if(!sound.isPlaying){
    //   sound.play();
    //   startedSoundTime = sound.context.currentTime;
    // }
    
  });
  document.getElementById('vr-button').appendChild(vrButton.domElement);
  document.getElementById('vr-button').addEventListener('click', function(){
    //initDaydream();
    
      setTimeout(function(){
        if(!sound.isPlaying){
          sound.play();
          playAssets();
          startedSoundTime = sound.context.currentTime;
        }
      },500);
    
  });

  document.getElementById('magic-window').addEventListener('click', function() {
    vrButton.requestEnterFullscreen();
    initDesktop();

   setTimeout(function(){
        if(!sound.isPlaying){
          sound.play();
          playAssets();
          startedSoundTime = sound.context.currentTime;
        }
      },500);

    //initDaydream();
  });
  setupStage();
  loadAudio();
  loadModels();
}

function onTextureLoaded(texture) {
  // For high end VR devices like Vive and Oculus, take into account the stage
  // parameters provided.
  setupStage();
}

var frameNum = 0;
// Request animation frame loop function
function animate(timestamp) {
  if(sound.isPlaying){
    //console.log(sound.context.currentTime-startedSoundTime);
  }
   uniforms.u_time.value += .01;

  frameNum++;

  uniforms.u_time.value += .01;
  plane.geometry.verticesNeedUpdate = true;
  skyMesh.material.needsUpdate = true; 
  if(frameNum%3 === 0){
    for(var v = 0; v<planeResolution+1; v++){
      for(var i = planeResolution*2;i>0;i--){
        plane.geometry.vertices[v+((planeResolution+1)*i)].z=plane.geometry.vertices[((planeResolution+1)-v)+((planeResolution+1)*(i-1))].z;
      }
      plane.geometry.vertices[v].z = 0;
      plane.geometry.vertices[v].z=Math.pow(analyser.getFrequencyData()[v]*.01,3);
      plane.geometry.vertices[planeResolution-v].z+=Math.pow(analyser.getFrequencyData()[v]*.01,3);
    }
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

// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
function setupStage() {
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      vrDisplay = displays[0];
      console.log(displays)
      vrDisplay.requestAnimationFrame(animate);
    }
  });
}

window.addEventListener('load', onLoad);

function initDesktop(){
  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.enableZoom = false;
  // controls.target.y = camera.position.y;
}

var analyser;
function loadAudio(){
  //Create an AudioListener and add it to the camera
  var listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  sound = new THREE.Audio( listener );

  var audioLoader = new THREE.AudioLoader();

  //Load a sound and set it as the Audio object's buffer
  audioLoader.load( './assets/song.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop(false);
    sound.setVolume(0.5);
  });

  analyser = new THREE.AudioAnalyser( sound, 32 );
  
}

var assets = [];
var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {

          console.log( item, loaded, total );

        };
var onProgress = function ( xhr ) {
  if ( xhr.lengthComputable ) {
    var percentComplete = xhr.loaded / xhr.total * 100;
    console.log( Math.round(percentComplete, 2) + '% downloaded' );
  }
};

var onError = function ( xhr ) {
};
           
var loader = new THREE.OBJLoader( manager );

var models = {
  astronaut: {
    name: 'astronaut',
    scale: new THREE.Vector3( 3, 3, 3 )
  },
  EMU: {
    name: 'EMU',
    scale: new THREE.Vector3( 3, 3, 3 )
  },
  STS: {
    name: 'STS',
    scale: new THREE.Vector3( 2, 2, 2 )
  },
  ISS: {
    name: 'ISS',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  Hubble: {
    name: 'Hubble',
    scale: new THREE.Vector3( .05, .05, .05 )
  },
  LRO: {
    name: 'LRO',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  LEM: {
    name: 'LEM',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  Dawn: {
    name: 'Dawn',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  MGS_mapping: {
    name: 'MGS_mapping',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  MESSENGER: {
    name: 'MESSENGER',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  Rosetta: {
    name: 'Rosetta',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  galileo: {
    name: 'galileo',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  Titan_Sub: {
    name: 'Titan_Sub',
    scale: new THREE.Vector3( 1, 1, 1 )
  },
  Cassini: {
    name: 'Cassini',
    scale: new THREE.Vector3(.05, .05, .05)
  },
  voyager: {
    name: 'voyager',
    scale: new THREE.Vector3( .05, .05, .05 )
  },
}

function loadModels(){
  for (var i in models){ 
      (function(index){
          loader.load( './assets/space_obj/' + models[index].name + '.obj', function ( object ) { 
              //object.name=load_obj; 
              object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                  child.material = new THREE.MeshBasicMaterial( {color:new THREE.Color("hsl("+Math.random()*90+", 100%, 50%)"), wireframe:true} );
                }
              });        
              scene.add( object );  
              object.scale.set( .1, .1, .1 );
              object.position.z-=200;  
              object.visible= false;  
              models[index].model = object;    
          }, onProgress, onError ); 
      })(i);
  }
};

function playAssets(){
  setTimeout(function(){
    animateModel('astronaut');
  },100);

  setTimeout(function(){
    animateModel('EMU');
  },10000);

  setTimeout(function(){
    animateModel('STS');
  },20000);

  setTimeout(function(){
    animateModel('ISS');
  },30000);

  setTimeout(function(){
    animateModel('Hubble');
  },40000);

  setTimeout(function(){
    animateModel('LRO');
  },50000);

  setTimeout(function(){
    animateModel('LEM');
  },60000);

  setTimeout(function(){
    animateModel('Dawn');
  },70000);

  setTimeout(function(){
    animateModel('MGS_mapping');
  },80000);

  setTimeout(function(){
    animateModel('MESSENGER');
  },90000);

  setTimeout(function(){
    animateModel('Rosetta');
  },100000);

  setTimeout(function(){
    animateModel('galileo');
  },110000);

  setTimeout(function(){
    animateModel('Cassini');
  },120000);

  setTimeout(function(){
    animateModel('Titan_Sub');
  },130000);

  setTimeout(function(){
    animateModel('voyager');
  },140000);
}
function animateModel(modelName){
  var _model = models[modelName].model;
  var targetScale = models[modelName].scale;

  _model.visible = true;
  _model.position.set( 0, 0, -200 );
  _model.rotation.set( 0, 0, 0 );
  _model.scale.set( 0, 0, 0 );
  TweenLite.to(_model.position, 30, { 
      z: 100,
      y: 10*((Math.round(Math.random())*2)),
      x: 10*((Math.round(Math.random())*2)-1),
      ease:Linear.easeNone,
      onComplete: function(){
        _model.visible = false;
       return;
      }
  });
  TweenLite.to(_model.rotation, 30, { 
      z: Math.random()*4,
      y: Math.random()*4,
      x: Math.random()*4,
      ease:Linear.easeNone
  });
  TweenLite.to(_model.scale, 30, { 
      z: targetScale.z,
      y: targetScale.y,
      x: targetScale.x,
      ease:Linear.easeNone
  });
}