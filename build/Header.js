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

//Control Bending of the floor
var floorControls = {
  bendX: 0,
  bendY: 0,
  stage: 0,
  particleTarget : new THREE.Vector3( 0, 0, 0 )
}

var firstLineAnimate = true;

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
    scale: new THREE.Vector3( .01, .01, .01 )
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
    scale: new THREE.Vector3( .1, .1, .1 )
  },
  MGS_mapping: {
    name: 'MGS_mapping',
    scale: new THREE.Vector3( .1, .1, .1 )
  },
  MESSENGER: {
    name: 'MESSENGER',
    scale: new THREE.Vector3( .1, .1, .1 )
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

var particlesData = [];
var maxParticleCount = 200;
var particleCount = 200;
var r = 800;
var rHalf = r / 2;
var group = new THREE.Group();

var effectController = {
	showDots: true,
	showLines: true,
	minDistance: 12,
	limitConnections: false,
	maxConnections: 2000,
	particleCount: 25
};

var linesMesh;
var pMaterial;
var colors, positions;
var particles;

var floorForward = 0;

var assets = [];

var frameNum = 0;

var analyser;