function playAssets(){

  TweenLite.to(uniforms.u_atmosphere, 60, { 
      value: -.5,
  });

  TweenLite.to(uniforms.u_tint.value, 30,{
    x:.4,
    y:.3,
    z:.7
  });

  var interval=2250;
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

  //Titan Sub, Don't use?
  // time+=interval;
  // setTimeout(function(){
  //   animateModel('Titan_Sub');
  // },time);

  time+=interval; 

  setTimeout(function(){
    animateModel('voyager');
  },time);

  setTimeout(function(){
    floorControls.stage = 1;
    TweenLite.to(floorControls, 3, { 
        bendX: 1,
        bendY: 1
    });
  },53000);

  setTimeout(function(){
    floorControls.stage = 2;
    floorControls.bendX = 0;
    floorControls.bendY = 0;

     TweenLite.to(floorControls, 3, { 
       bendX: 1,
       bendY: 1
    });
   },72000);

  setTimeout(function(){
    floorControls.stage = 3;
    for(var p in particlesData){
      particlesData[p].velocity = new THREE.Vector3( -.5 + Math.random(), -.5 + Math.random(),  -.5 + Math.random() )
    }
  }, 88000);
  
  setTimeout(function(){
     TweenLite.to(floorControls, 1, { 
       bendX: 0,
       bendY: 0
    });

     firstLineAnimate = false;
     floorControls.stage = 3;


    for(var p in particlesData){
      
      
      var x_index = p*3;
      var y_index = p*3+1;
      var z_index = p*3+2;

      var p_x = particlePositions[x_index];
      var p_y = particlePositions[y_index];
      var p_z = particlePositions[z_index];

      var p_position = new THREE.Vector3( p_x, p_y, p_z );

      var dir_to_middle = p_position.sub(new THREE.Vector3( 0, 0, 0 ));
      dir_to_middle.normalize();
      console.log(dir_to_middle)
      dir_to_middle.multiplyScalar ( -1 );
      particlesData[p].velocity.z = 0;
      particlesData[p].velocity.x = dir_to_middle.x//lerp( particlesData[p].velocity.x, -dir_to_middle.x, .01);
      particlesData[p].velocity.y = dir_to_middle.y//lerp( particlesData[p].velocity.y, -dir_to_middle.y, .01);
      particlesData[p].velocity.z = dir_to_middle.z//lerp( particlesData[p].velocity.z, -dir_to_middle.z, .01);
    }

  }, 114000);
}

function animateModel(modelName){
  console.log('animating '+modelName)
  var _model = models[modelName].model;
  var targetScale = models[modelName].scale;

  _model.visible = true;
  _model.position.set( 10*((Math.round(Math.random())*2)-1), 10*((Math.round(Math.random())*2)), -100 );
  _model.rotation.set( 0, 0, 0 );
  _model.scale.set( targetScale.x, targetScale.y, targetScale.z);
  TweenLite.to(_model.position, 30, { 
      z: 100,
      y: 10*((Math.round(Math.random())*2)),
      x: 10*((Math.round(Math.random())*2)-1),
      ease:Linear.easeNone,
      onComplete: function(){
        _model.visible = false;
        scene.remove(_model);
       return;
      }
  });
  TweenLite.to(_model.rotation, 30, { 
      z: Math.random()*4,
      y: Math.random()*4,
      x: Math.random()*4,
      ease:Linear.easeNone
  });
  //scene.children[8].children[0].material.opacity
  TweenLite.to(_model.children[0].material,5, {
    opacity: .1
  });
  // TweenLite.to(_model.scale, 30, { 
  //     z: targetScale.z,
  //     y: targetScale.y,
  //     x: targetScale.x,
  //     ease:Linear.easeNone
  // });
}

function animateFloor(){
  floorForward++;
  if(floorForward%10===0 && floorControls.stage < 3){
    scene.children[1].position.z-=10;
  }

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

    //particlePositions[z_index]+=floorForward
    if(i<planeResolution && firstLineAnimate){
      var planePosition_x = ((i%planeResolution)*10)-(planeResolution/2)*10;
      var planePosition_y = -30;
      //particlePositions[z_index] = (Math.floor(i/planeResolution)*10)-(planeResolution)*10;
      particlePositions[y_index] = planePosition_y;
      particlePositions[x_index] = planePosition_x;

      var tubePosition_y = Math.sin(i%planeResolution/2)*planeResolution;
      var tubePosition_x = Math.cos(i%planeResolution/2)*planeResolution;

      var tubePosition2_y = Math.cos(i%planeResolution/2)*planeResolution;
      var tubePosition2_x = Math.sin(i%planeResolution/2)*planeResolution;

      switch(floorControls.stage){
        case 1:
          particlePositions[y_index] = lerp(planePosition_y,tubePosition_y,floorControls.bendY);
          particlePositions[x_index] = lerp(planePosition_x,tubePosition_x,floorControls.bendX);
        break;
        case 2:
          particlePositions[y_index] = lerp(tubePosition_y,tubePosition2_y,floorControls.bendY);
          particlePositions[x_index] = lerp(tubePosition_y,tubePosition2_x,floorControls.bendX);
        break;
        case 3:
          particlePositions[y_index] = lerp(planePosition_y,tubePosition_y,floorControls.bendY);
          particlePositions[x_index] = lerp(planePosition_x,tubePosition_x,floorControls.bendX);
        break;
        default:
        break;
      }

      particlePositions[y_index] += (analyser.getFrequencyData()[(i%planeResolution)]*.05);
      particlePositions[y_index] += (analyser.getFrequencyData()[planeResolution-(i%planeResolution)]*.05);

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

  if(firstLineAnimate){
    for(var j = particleCount;j>planeResolution;j--){
      particlePositions[(j-1)*3+1] = particlePositions[((j-1)*3+1)-(planeResolution*3)];
      particlePositions[(j-1)*3] = particlePositions[((j-1)*3)-(planeResolution*3)];
    }
  }

  linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
  linesMesh.geometry.attributes.position.needsUpdate = true;
  linesMesh.geometry.attributes.color.needsUpdate = true;

  group.children[0].geometry.attributes.position.needsUpdate = true;
}