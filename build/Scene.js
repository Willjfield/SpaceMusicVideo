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

var floorControls = {
  bendX: 0,
  bendY: 0
}

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
  
  var vertex = document.getElementById('vertexShader').innerHTML;
  var fragment = document.getElementById('fragmentShader').innerHTML;
  //console.log(fragment)
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
  var skyGeometry = new THREE.IcosahedronBufferGeometry(1000, 3)
  skyGeometry.phiLength = Math.PI/2;
  skyMesh = new THREE.Mesh( skyGeometry, skyMaterial);
  scene.add(skyMesh);


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

  var floorGroup = buildFloor();
  scene.add(floorGroup);
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
  // plane.geometry.verticesNeedUpdate = true;
  // plane.geometry.colorsNeedUpdate = true;
  
  skyMesh.material.needsUpdate = true; 
  animateFloor();

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
    scale: new THREE.Vector3( .1, .1, .1 )
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
    scale: new THREE.Vector3( .1, .1, .1 )
  },
  galileo: {
    name: 'galileo',
    scale: new THREE.Vector3( .001, .001, .001 )
  },
  Titan_Sub: {
    name: 'Titan_Sub',
    scale: new THREE.Vector3( .0025, .0025, .0025 )
  },
  Cassini: {
    name: 'Cassini',
    scale: new THREE.Vector3(.025, .025, .025)
  },
  voyager: {
    name: 'voyager',
    scale: new THREE.Vector3( .1, .1, .1 )
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
  // if( uniforms.u_atmosphere.value>0){
  //   uniforms.u_atmosphere.value -= .01;
  // }

  TweenLite.to(uniforms.u_atmosphere, 60, { 
        value: -.8,
    });

  TweenLite.to(uniforms.u_tint.value, 30,{
    x:.4,
    y:.3,
    z:.7
  });

  var interval=1750;
  var time = 1000;
  setTimeout(function(){
    animateModel('astronaut');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('EMU');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('STS');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('ISS');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('Hubble');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('LRO');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('LEM');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('Dawn');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('MGS_mapping');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('MESSENGER');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('Rosetta');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('galileo');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('Cassini');
  },time);

  time+=interval;

  setTimeout(function(){
    animateModel('Titan_Sub');
  },time);

  time+=interval; 

  setTimeout(function(){
    animateModel('voyager');
  },time);

  setTimeout(function(){
    TweenLite.to(floorControls, 3, { 
        bendX: 1,
        bendY: 1
    });
  },53000);

  setTimeout(function(){
    for(var p in particlesData){
      particlesData[p].velocity = new THREE.Vector3( -.5 + Math.random(), -.5 + Math.random(),  -.5 + Math.random() )
    }
  }, 89000)
  
}
function animateModel(modelName){
  console.log('animating '+modelName)
  var _model = models[modelName].model;
  var targetScale = models[modelName].scale;

  _model.visible = true;
  _model.position.set( 10*((Math.round(Math.random())*2)-1), 10*((Math.round(Math.random())*2)), -200 );
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

  var particlesData = [];
  var maxParticleCount = 1000;
  var particleCount = 500;
  var r = 800;
  var rHalf = r / 2;
  var group = new THREE.Group();
    var effectController = {
    showDots: true,
    showLines: true,
    minDistance: 11,
    limitConnections: false,
    maxConnections: 2000,
    particleCount: 50
  };
  var linesMesh;
  var pMaterial;
  var colors, positions;
  var particles;

function buildFloor(){

  var segments = maxParticleCount * maxParticleCount;

  positions = new Float32Array( segments * 3 );
  colors = new Float32Array( segments * 3 );

 pMaterial = new THREE.PointsMaterial( {
    color: 0xff0088,
    size: 2,
   blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: false
  } );

  particles = new THREE.BufferGeometry();
  particlePositions = new Float32Array( maxParticleCount * 3 );

  for ( var i = 0; i < maxParticleCount; i++ ) {

    var x = ((i%planeResolution)*10)-(planeResolution/2)*10;
    var y = -30;
    var z = (Math.floor(i/planeResolution)*10)-(planeResolution)*10;

    particlePositions[ i * 3     ] = x;
    particlePositions[ i * 3 + 1 ] = y;
    particlePositions[ i * 3 + 2 ] = z;

    // add it to the geometry
    particlesData.push( {
      //velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
      velocity: new THREE.Vector3( 0, 0, 0 ),
      numConnections: 0
    } );
  }

  particles.setDrawRange( 0, particleCount );
  particles.addAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setDynamic( true ) );

  // create the particle system
  pointCloud = new THREE.Points( particles, pMaterial );
  group.add( pointCloud );

  var geometry = new THREE.BufferGeometry();

  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setDynamic( true ) );
  geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );

  geometry.computeBoundingSphere();

  //geometry.setDrawRange( 0, 0 );

  var material = new THREE.LineBasicMaterial( {
    vertexColors: THREE.VertexColors,
    color:0xff0088,
    blending: THREE.AdditiveBlending,
    transparent: true,
  } );

  linesMesh = new THREE.Line( geometry, material );
  linesMesh.frustumCulled = false;
  group.add( linesMesh );

  return group;
}

var floorForward = 0;
function animateFloor(){
  //floorForward+=.0003;
  var vertexpos = 0;
  var colorpos = 0;
  var numConnected = 0;

  for ( var i = 0; i < particleCount; i++ )
    particlesData[ i ].numConnections = 0;

  for ( var i = 0; i < particleCount; i++ ) {

    // get the particle
    var particleData = particlesData[i];

    var x_index = i*3;
    var y_index = i*3+1;
    var z_index = i*3+2;

    particlePositions[z_index]+=floorForward
    if(i<planeResolution){
      var planePosition_x = ((i%planeResolution)*10)-(planeResolution/2)*10;
      var planePosition_y = -30;
      particlePositions[z_index] = (Math.floor(i/planeResolution)*10)-(planeResolution)*10;

      var tubePosition_y = Math.sin(i%planeResolution/2)*planeResolution
      var tubePosition_x = Math.cos(i%planeResolution/2)*planeResolution

      particlePositions[y_index] = lerp(planePosition_y,tubePosition_y,floorControls.bendY);
      particlePositions[x_index] = lerp(planePosition_x,tubePosition_x,floorControls.bendX);

      particlePositions[y_index] += (analyser.getFrequencyData()[(i%planeResolution)]*.05);
      particlePositions[y_index] += (analyser.getFrequencyData()[planeResolution-(i%planeResolution)]*.05);

      particlePositions[z_index] += (analyser.getFrequencyData()[(i%planeResolution)]*.05)*floorControls.bendX;
      particlePositions[z_index] += (analyser.getFrequencyData()[planeResolution-(i%planeResolution)]*.05)*floorControls.bendX;

      particlePositions[y_index] -=10
    }

    
    particlePositions[ i * 3     ] += particleData.velocity.x;
    particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
    particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

    if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
      continue;

    // Check collision
    for ( var j = i + 1; j < particleCount; j++ ) {

      var particleDataB = particlesData[ j ];
      if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
        continue;

      var dx = particlePositions[ x_index ] - particlePositions[ j * 3     ];
      var dy = particlePositions[ y_index ] - particlePositions[ j * 3 + 1 ];
      var dz = particlePositions[ z_index ] - particlePositions[ j * 3 + 2 ];
      var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

      if ( dist < effectController.minDistance*2 ) {

        particleData.numConnections++;
        particleDataB.numConnections++;

        var alpha = 1.0 - dist / effectController.minDistance;

        positions[ vertexpos++ ] = particlePositions[ i * 3     ];
        positions[ vertexpos++ ] = particlePositions[ i * 3 + 1 ];
        positions[ vertexpos++ ] = particlePositions[ i * 3 + 2 ];

        positions[ vertexpos++ ] = particlePositions[ j * 3     ];
        positions[ vertexpos++ ] = particlePositions[ j * 3 + 1 ];
        positions[ vertexpos++ ] = particlePositions[ j * 3 + 2 ];

        colors[ colorpos++ ] = alpha;
        colors[ colorpos++ ] = alpha;
        colors[ colorpos++ ] = alpha;

        colors[ colorpos++ ] = alpha;
        colors[ colorpos++ ] = alpha;
        colors[ colorpos++ ] = alpha;

        numConnected++;
      }
    }
  }
  for(var j = particleCount;j>planeResolution;j--){
    particlePositions[(j-1)*3+1] = particlePositions[((j-1)*3+1)-(planeResolution*3)];
    particlePositions[(j-1)*3] = particlePositions[((j-1)*3)-(planeResolution*3)];
  }

  linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
  linesMesh.geometry.attributes.position.needsUpdate = true;
  linesMesh.geometry.attributes.color.needsUpdate = true;

  group.children[0].geometry.attributes.position.needsUpdate = true;
}

function lerp(start, end, percent)
{
     return (start + percent*(end - start));
}