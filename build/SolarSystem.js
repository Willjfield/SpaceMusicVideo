var planets = {
	mercury:{
		name:'mercury',
		size:.1,
		pos:.1,
		offset: .1,
		color: new THREE.Color( 0xffffff )
	},
	venus:{
		name:'venus',
		size:1,
		pos:.5,
		offset: -1,
		color: new THREE.Color( 0xff6622 )
	},
	earth:{
		name:'earth',
		size:1,
		pos:1,
		offset: .5,
		color: new THREE.Color( 0x2288ff )
	},
	mars:{
		name:'mars',
		size:.75,
		pos:2,
		offset: 1,
		color: new THREE.Color( 0xff3300 )
	},
	jupiter:{
		name:'jupiter',
		size:10,
		pos:4,
		offset: 5,
		color: new THREE.Color( 0xff4488 )
	},
	saturn:{
		name:'saturn',
		size:9,
		pos:7,
		offset: -5,
		color: new THREE.Color( 0xffff44 )
	},
	uranus:{
		name:'uranus',
		size:8,
		pos:8,
		offset: 4,
		color: new THREE.Color( 0x0066ff )
	},
	neptune:{
		name:'neptune',
		size:8,
		pos:10,
		offset: -3,
		color: new THREE.Color( 0x8822ff )
	}
}
const planet_scale = .1;
const system_scale = 10;
function createPlanet(planet){
	const geo = new THREE.IcosahedronGeometry( planet.size*planet_scale, 1 );
	const mat = new THREE.MeshBasicMaterial( {color: planet.color, wireframe:true} );
	const new_planet = new THREE.Mesh(geo, mat);
	new_planet.name = planet.name;
	new_planet.position.x = planet.offset;
	new_planet.position.z = planet.pos*system_scale*-1;
	return new_planet; 
}

function createSolarSystem(){
	let solar_system = new THREE.Object3D();
	solar_system.name = "Solar System";

	solar_system.add(createPlanet(planets.mercury));
	solar_system.add(createPlanet(planets.venus));
	solar_system.add(createPlanet(planets.earth));
	solar_system.add(createPlanet(planets.mars));
	solar_system.add(createPlanet(planets.jupiter));
	solar_system.add(createPlanet(planets.saturn));
	solar_system.add(createPlanet(planets.uranus));
	solar_system.add(createPlanet(planets.neptune));

	scene.add(solar_system);
}

function destroySolarSystem(){
	scene.remove(scene.getObjectByName( "Solar System" ));
}