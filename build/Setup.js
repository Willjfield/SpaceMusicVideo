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

function initDesktop(){}

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
    var y = -40;
    var z = (Math.floor(i/planeResolution)*10)-(planeResolution)*10;

    particlePositions[ i * 3     ] = x;
    particlePositions[ i * 3 + 1 ] = y;
    particlePositions[ i * 3 + 2 ] = z;

    // add it to the geometry
    particlesData.push( {
      //velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
      velocity: new THREE.Vector3( 0, 0, 1 ),
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