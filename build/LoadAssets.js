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
    document.getElementById('ui').style.display = 'block';
    //controls.userHeight = -30
    //controls.update();

  });

  analyser = new THREE.AudioAnalyser( sound, 32 );
  
}


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

var onError = function ( xhr ) {};
           
var loader = new THREE.OBJLoader( manager );

function loadModels(){
  for (var i in models){ 
      (function(index){
          loader.load( './assets/space_obj/' + models[index].name + '.obj', function ( object ) { 
              //object.name=load_obj; 
              object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                  child.material = new THREE.MeshBasicMaterial( {color:new THREE.Color("hsl("+Math.random()*90+", 100%, 50%)"), wireframe:true, transparent:true, opacity:0} );
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