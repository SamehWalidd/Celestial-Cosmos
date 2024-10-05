import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { fetchLimitedData } from "./api.js";

// Load textures
const textures = [];
const textureLoader = new THREE.TextureLoader();
const starsTexture = textureLoader.load('./img/stars.jpg');
const sunTexture = textureLoader.load('./img/sun.jpg');
const mercuryTexture = textureLoader.load('./img/mercury.jpg');
const venusTexture = textureLoader.load('./img/venus.jpg');
const earthTexture = textureLoader.load('./img/earth.jpg');
const marsTexture = textureLoader.load('./img/mars.jpg');
const jupiterTexture = textureLoader.load('./img/jupiter.jpg');
const saturnTexture = textureLoader.load('./img/saturn.jpg');
const saturnRingTexture = textureLoader.load('./img/saturn ring.png');
const uranusTexture = textureLoader.load('./img/uranus.jpg');
const uranusRingTexture = textureLoader.load('./img/uranus ring.png');
const neptuneTexture = textureLoader.load('./img/neptune.jpg');
const asteroidTexture = textureLoader.load('./img/13302.jpg');

textures.push(
    starsTexture,
    sunTexture,
    mercuryTexture,
    venusTexture,
    earthTexture,
    marsTexture,
    jupiterTexture,
    saturnTexture,
    saturnRingTexture,
    uranusTexture,
    uranusRingTexture,
    neptuneTexture,
   asteroidTexture
);

let asteroidNames = [];
fetchLimitedData().then(data => {
    asteroidNames = data;
});

// Hide start menu
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', function() {
    startMenu.classList.add('hidden'); 
});

// Set color space for textures
textures.forEach(function(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
});

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-200, 100, 200);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

const ambientLight2 = new THREE.AmbientLight(0xffffff, 0.4); // Soft ambient light
scene.add(ambientLight2);

const pointLight = new THREE.PointLight(0xffffff, 30000, 300);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 500); // Strong point light for highlighting asteroids
pointLight2.position.set(50, 50, 50); // Adjust to your scene
scene.add(pointLight2);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(100, 100, 100);
scene.add(directionalLight);

scene.background = starsTexture;

// Create Sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Create planets array
const planets = [];
const rotationStates = {};

// Create Planet Function
function createPlanet(size, texture, distance, speed, ring) {
   
    const orbitgeo = new THREE.RingGeometry(
        distance, distance+0.1, 35
    )
    const orbitmat = new THREE.MeshBasicMaterial({color:0xffffff})
    const orbit = new THREE.Mesh(orbitgeo, orbitmat);
    orbit.rotation.x =  -0.5 * Math.PI;
    const loader = new THREE.TextureLoader();
    const Texture = loader.load(texture);
    Texture.colorSpace = THREE.SRGBColorSpace;

    

    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.5,
        metalness: 0.1 
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    obj.add(orbit);

    if (ring) {
        const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
        const ringMat = new THREE.MeshBasicMaterial({ map: ring.texture, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -0.5 * Math.PI;
        ringMesh.position.x = distance; 
        obj.add(ringMesh); 
    }

    

    mesh.position.x = distance; 
    scene.add(obj);
    planets.push({ mesh, obj, texture, ring, speed });

    // Initialize rotation state
    rotationStates[mesh.uuid] = true;

    return { mesh, obj };
}

// Create Planets with unique distances and speeds
const mercury = createPlanet(2, mercuryTexture, 28, 0.05);
const venus = createPlanet(4, venusTexture, 44, 0.035);
const earth = createPlanet(4.5, earthTexture, 62, 0.03);
const mars = createPlanet(3, marsTexture, 78, 0.028);
const jupiter = createPlanet(8, jupiterTexture, 100, 0.025);
const saturn = createPlanet(6, saturnTexture, 138, 0.022, {
    innerRadius: 7,
    outerRadius: 12,
    texture: saturnRingTexture
});
const uranus = createPlanet(5, uranusTexture, 176, 0.020, {
    innerRadius: 4,
    outerRadius: 9,
    texture: uranusRingTexture
});
const neptune = createPlanet(5, neptuneTexture, 200, 0.018);


function createAsteroids() {
    const asteroids = [];
    for (let i = 0; i < 50; i++) {
        const size = 0.5 + Math.random() * 2;
        const asteroidGeo = new THREE.DodecahedronGeometry(size, 0);
        
        // Asteroid material with grey-yellow color
        const asteroidMat = new THREE.MeshStandardMaterial({
            map: asteroidTexture,       // Grey-yellow color
            roughness: 0.7,        // Moderate roughness for realistic light reflection
            metalness: 0.3,        // Slight metallic effect for reflective highlights
        });
        
        const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);

        // Positioning asteroids randomly in space
        asteroid.position.x = (Math.random() - 0.5) * 500;
        asteroid.position.y = (Math.random() - 0.5) * 500;
        asteroid.position.z = (Math.random() - 0.5) * 500;

        // Random rotation for each asteroid
        asteroid.rotation.x = Math.random() * 2 * Math.PI;
        asteroid.rotation.y = Math.random() * 2 * Math.PI;
        asteroid.rotation.z = Math.random() * 2 * Math.PI;

        // Setting random rotation speeds
        asteroid.r = {
            x: Math.random() * 0.005,
            y: Math.random() * 0.005,
            z: Math.random() * 0.005
        };

        asteroids.push(asteroid);
        scene.add(asteroid);
    }
    return asteroids;
}

// Call the function to create asteroids
const asteroids = createAsteroids();

// Raycaster and Mouse for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetPlanet = null;
let isFollowingPlanet = false; // To track if the camera is following a planet
let followDistance = 20; // Distance the camera will stay away from the planet

// Function to smoothly move camera towards target
function followPlanet(target) {
    const targetPosition = new THREE.Vector3();
    target.mesh.getWorldPosition(targetPosition); // Get planet's position

    // Calculate where the camera should move to (behind the planet)
    const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();
    const followPosition = new THREE.Vector3().addVectors(targetPosition, direction.multiplyScalar(followDistance));

    // Check if the camera is already close enough to the target planet
    if (camera.position.distanceTo(followPosition) > 0.1) {
        // Use Vector3.lerp to smoothly transition camera position
        camera.position.lerp(followPosition, 0.05); // Smooth movement
        camera.lookAt(targetPosition); // Make the camera look at the planet
    } else {
        // Stop following once the camera is close enough
        isFollowingPlanet = false;
        orbit.enabled = true; // Re-enable OrbitControls once camera reaches the planet
    }
}

// Raycasting and Click Event
const resetButton = document.createElement('button');
resetButton.innerText = 'Reset Camera';
resetButton.style.position = 'absolute';
resetButton.style.backgroundColor = 'transparent';
resetButton.style.border = '1px solid white';
resetButton.style.color = 'white';
resetButton.style.top = '60px';
resetButton.style.right = '10px';   
resetButton.style.display = 'none'; // Initially hidden
resetButton.style.borderRadius = '5px';
document.body.appendChild(resetButton);

resetButton.addEventListener('click', () => {
    camera.position.set(-200, 100, 200);
    camera.lookAt(scene.position);
    orbit.update();
    isFollowingPlanet = false;
    orbit.enabled = true;
    resetButton.style.display = 'none'; // Hide the button when reset
});
    

// Show the reset button when following a planet
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;

        // Toggle rotation state
        rotationStates[clickedPlanet.uuid] = !rotationStates[clickedPlanet.uuid];

        // Set target planet for the camera to follow
        targetPlanet = planets.find(p => p.mesh.uuid === clickedPlanet.uuid);
        isFollowingPlanet = true;

        // Disable OrbitControls while following the planet
        orbit.enabled = false;

        
        // Show the reset buttonset button
        resetButton.style.display = 'block';
        resetButton.style.zIndex = '1000';
        resetButton.style.borderRadius = '5px';
        resetButton.style.padding = '10px';
        resetButton.style.fontFamily = 'Orbitron, sans-serif';

        
    }
});

resetButton.addEventListener('mouseover', () => {
    resetButton.style.backgroundColor = '#555'; // Change background color
    resetButton.style.color = 'yellow'; // Change text color
    resetButton.style.transform = 'scale(1.1)'; // Slightly increase size
  });
  
  resetButton.addEventListener('mouseout', () => {
    resetButton.style.backgroundColor = '#333'; // Reset background color
    resetButton.style.color = 'white'; // Reset text color
    resetButton.style.transform = 'scale(1)'; // Reset size
  });

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;

        // Toggle rotation state
        rotationStates[clickedPlanet.uuid] = !rotationStates[clickedPlanet.uuid];

        // Set target planet for the camera to follow
        targetPlanet = planets.find(p => p.mesh.uuid === clickedPlanet.uuid);
        isFollowingPlanet = true;

        // Disable OrbitControls while following the planet
        orbit.enabled = false;
    }
});

// Animate Function
function animate() {
    sun.rotateY(0.004);

    // Rotate planets with unique speeds
    planets.forEach(planet => {
        if (rotationStates[planet.mesh.uuid]) {
            planet.mesh.rotateY(0.004); // Rotate the planet itself
        }
        planet.obj.rotateY(planet.speed); // Rotate the planet around the sun at its unique speed
    });

    // Follow planet if one is selected
    if (isFollowingPlanet && targetPlanet) {
        followPlanet(targetPlanet);
    }

    asteroids.forEach(asteroid => {
        asteroid.rotation.x += asteroid.r.x;
        asteroid.rotation.y += asteroid.r.y;
        asteroid.rotation.z += asteroid.r.z;
        
    });

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Handle window resizing
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// Information boxes
const infoBox = document.createElement('div');
infoBox.style.position = 'absolute';
infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
infoBox.style.color = 'white';
infoBox.style.padding = '10px';
infoBox.style.borderRadius = '5px';
infoBox.style.display = 'none';
document.body.appendChild(infoBox);

// Fetch planet information from API
async function fetchPlanetInfo(planetName) {
  const response = await fetch(`https://planets-api.vercel.app/api/v1/planets/${planetName}`);
  const data = await response.json();
  console.log(data);
  return data;
}

const planetNames = [
  'mercury', 
  'venus', 
  'earth', 
  'mars', 
  'jupiter', 
  'saturn', 
  'uranus', 
  'neptune', 
];


// Show information box for a specific planet
function showInfoBox(planet) {
  // Fetch planet information
  fetchPlanetInfo(planet).then(data => {
      // Determine the index of the current planet
      const currentIndex = planetNames.indexOf(planet);
      
      // Set the innerHTML content with planet information
      infoBox.innerHTML = `
          <style>
              /* Info box navigation styles */
              .info-navigation {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  width: 100%;
                  margin-bottom: 20px;
                  font-family: 'Orbitron', sans-serif;
              }
              .planet-name {
                  font-size: 18px;
                  font-weight: bold;
                  text-align: center;
                  flex: 1; /* Allow the planet name to grow */
              }
              .arrow {
                  font-size: 24px; /* Adjust size of the arrows */
                  cursor: pointer;
                  padding: 10px;
                  transition: color 0.3s;
              }
              .arrow:hover {
                  font-size: 28px; /* Increase size on hover */
                  color: yellow; /* Change color on hover */
              }
          </style>
          <div class="info-navigation">
              <span id="prevPlanet" class="arrow">&larr;</span>
              <div class="planet-name">${data.name}</div>
              <span id="nextPlanet" class="arrow">&rarr;</span>
          </div>
          <p>Brief: ${data.overview.content}</p>
          <p>Radius: ${data.radius}</p>
          <p>Revolution: ${data.revolution}</p>
          <p>Rotation: ${data.rotation}</p>
          <p>Temperature: ${data.temperature}</p>
      `;

      // Apply CSS styles for the info box
      infoBox.style.position = 'fixed';
      infoBox.style.display = 'flex';
      infoBox.style.flexDirection = 'column';
      infoBox.style.alignItems = 'center';
      infoBox.style.justifyContent = 'center';
      infoBox.style.gap = '10px';
      infoBox.style.top = '0';
      infoBox.style.left = '0';
      infoBox.style.width = '25%';
      infoBox.style.height = '100vh';
      infoBox.style.padding = '20px';
      infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      infoBox.style.color = '#fff';
      infoBox.style.fontFamily = 'Orbitron, sans-serif';
      infoBox.style.fontSize = '14px';
      infoBox.style.boxShadow = '2px 0 10px rgba(0, 0, 0, 0.5)';
      infoBox.style.zIndex = '1000';
      infoBox.style.overflowY = 'auto';

      // Add click event for previous planet
      const prevPlanetButton = document.getElementById('prevPlanet');
      prevPlanetButton.onclick = () => {
          const prevIndex = (currentIndex - 1 + planetNames.length) % planetNames.length; // Loop back to the last planet
          showInfoBox(planetNames[prevIndex]); // Call showInfoBox with the previous planet name
          targetPlanet = planets[prevIndex];
          followPlanet(targetPlanet);
      };

      // Add click event for next planet
      const nextPlanetButton = document.getElementById('nextPlanet');
      nextPlanetButton.onclick = () => {
          const nextIndex = (currentIndex + 1) % planetNames.length; // Loop back to the first planet
          showInfoBox(planetNames[nextIndex]); // Call showInfoBox with the next planet name
          targetPlanet = planets[nextIndex];
          followPlanet(planets[nextIndex]);

      };
  });
}



// Hide information box
function hideInfoBox() {
  infoBox.style.display? infoBox.style.display = 'none' : infoBox.style.display = 'block';
}

// Update click event to show information box
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const clickedPlanet = intersects[0].object;

    // Toggle rotation state
    rotationStates[clickedPlanet.uuid] = !rotationStates[clickedPlanet.uuid];

    // Set target planet for the camera to follow
    targetPlanet = planets.find(p => p.mesh.uuid === clickedPlanet.uuid);
    isFollowingPlanet = true;

    // Disable OrbitControls while following the planet
    orbit.enabled = false;

    // Show the reset button
    resetButton.style.display = 'block';

    // Show information box
    showInfoBox(targetPlanet.texture.image.currentSrc.split('/').pop().split('.')[0], event);
  } else {
    hideInfoBox();
  }
});
// Create a div element for the asteroid name tooltip
const asteroidTooltip = document.createElement('div');
asteroidTooltip.style.position = 'absolute';
asteroidTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
asteroidTooltip.style.color = 'white';
asteroidTooltip.style.padding = '5px';
asteroidTooltip.style.borderRadius = '5px';
asteroidTooltip.style.display = 'none';
asteroidTooltip.style.pointerEvents = 'none'; // Prevent the tooltip from interfering with mouse events
document.body.appendChild(asteroidTooltip);

// Function to show the tooltip
function showAsteroidTooltip(name, x, y) {
    asteroidTooltip.innerText = name;
    asteroidTooltip.style.left = `${x + 10}px`; // Offset to avoid cursor overlap
    asteroidTooltip.style.top = `${y + 10}px`;
    asteroidTooltip.style.display = 'block';
}

// Function to hide the tooltip
function hideAsteroidTooltip() {
    asteroidTooltip.style.display = 'none';
}

// Add event listener for mouse move to detect hovering over asteroids
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(asteroids);

    if (intersects.length > 0) {
        const hoveredAsteroid = intersects[0].object;

        
        const asteroidIndex = asteroids.indexOf(hoveredAsteroid);
        if (asteroidIndex !== -1 && asteroidNames[asteroidIndex]) {
            showAsteroidTooltip(asteroidNames[asteroidIndex], event.clientX, event.clientY);
        } else {
            showAsteroidTooltip('Asteroid', event.clientX, event.clientY);
        }
    } else {
        hideAsteroidTooltip();
    }
});
// Create a dropdown menu for selecting view mode
const viewMenu = document.createElement('select');
viewMenu.style.position = 'absolute';
viewMenu.style.top = '10px';
viewMenu.style.left = '10px';
viewMenu.style.zIndex = '1000';
viewMenu.style.padding = '10px';
viewMenu.style.fontFamily = 'Orbitron, sans-serif';
viewMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
viewMenu.style.color = 'white';
viewMenu.style.border = '1px solid white';
viewMenu.style.borderRadius = '5px';

const optionAll = document.createElement('option');
optionAll.value = 'all';
optionAll.innerText = 'View All';
viewMenu.appendChild(optionAll);

const optionPlanets = document.createElement('option');
optionPlanets.value = 'planets';
optionPlanets.innerText = 'View Planets';
viewMenu.appendChild(optionPlanets);

const optionAsteroids = document.createElement('option');
optionAsteroids.value = 'asteroids';
optionAsteroids.innerText = 'View Asteroids';
viewMenu.appendChild(optionAsteroids);

document.body.appendChild(viewMenu);

// Function to update visibility based on selected view mode
function updateViewMode() {
    const selectedMode = viewMenu.value;

    if (selectedMode === 'planets') {
        planets.forEach(planet => planet.obj.visible = true);
        asteroids.forEach(asteroid => asteroid.visible = false);
        sun.visible = true;
    } else if (selectedMode === 'asteroids') {
        planets.forEach(planet => planet.obj.visible = false);
        asteroids.forEach(asteroid => asteroid.visible = true);
        sun.visible = false;
    } else {
        planets.forEach(planet => planet.obj.visible = true);
        asteroids.forEach(asteroid => asteroid.visible = true);
        sun.visible = true;
    }
}

// Add event listener to dropdown menu
viewMenu.addEventListener('change', updateViewMode);

// Initial view mode update
updateViewMode();
// Create a div element for the planet name tooltip
const planetTooltip = document.createElement('div');
planetTooltip.style.position = 'absolute';
planetTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
planetTooltip.style.color = 'white';
planetTooltip.style.padding = '5px';
planetTooltip.style.borderRadius = '5px';
planetTooltip.style.display = 'none';
planetTooltip.style.pointerEvents = 'none'; // Prevent the tooltip from interfering with mouse events
document.body.appendChild(planetTooltip);

// Function to show the tooltip
function showPlanetTooltip(name, x, y) {
    planetTooltip.innerText = name;
    planetTooltip.style.left = `${x + 10}px`; // Offset to avoid cursor overlap
    planetTooltip.style.top = `${y + 10}px`;
    planetTooltip.style.display = 'block';
}

// Function to hide the tooltip
function hidePlanetTooltip() {
    planetTooltip.style.display = 'none';
}

// Add event listener for mouse move to detect hovering over planets
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const hoveredPlanet = intersects[0].object;
        const planet = planets.find(p => p.mesh.uuid === hoveredPlanet.uuid);
        if (planet) {
            showPlanetTooltip(planet.texture.image.currentSrc.split('/').pop().split('.')[0], event.clientX, event.clientY);
        }
    } else {
        hidePlanetTooltip();
    }
});
// Create a dropdown menu for selecting planet speed
const speedMenu = document.createElement('select');
speedMenu.style.position = 'absolute';
speedMenu.style.top = '50px';
speedMenu.style.left = '10px';
speedMenu.style.zIndex = '1000';
speedMenu.style.padding = '10px';
speedMenu.style.fontFamily = 'Orbitron, sans-serif';
speedMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
speedMenu.style.color = 'white';
speedMenu.style.border = '1px solid white';
speedMenu.style.borderRadius = '5px';
speedMenu.style.marginTop = '12.45px';

const optionSlow = document.createElement('option');
optionSlow.value = 'slow';
optionSlow.innerText = 'Slow';
speedMenu.appendChild(optionSlow);

const optionNormal = document.createElement('option');
optionNormal.value = 'normal';
optionNormal.innerText = 'Normal';
speedMenu.appendChild(optionNormal);

const optionFast = document.createElement('option');
optionFast.value = 'fast';
optionFast.innerText = 'Fast';
speedMenu.appendChild(optionFast);

document.body.appendChild(speedMenu);

// Function to update planet speeds based on selected speed mode
function updateSpeedMode() {
    const selectedSpeed = speedMenu.value;
    let speedMultiplier;

    if (selectedSpeed === 'slow') {
        speedMultiplier = 0.5;
    } else if (selectedSpeed === 'fast') {
        speedMultiplier = 2;
    } else {
        speedMultiplier = 1;
    }

    planets.forEach(planet => {
        planet.speed *= speedMultiplier;
    });
}

// Add event listener to dropdown menu
speedMenu.addEventListener('change', updateSpeedMode);

// Initial speed mode update
updateSpeedMode();


// Create a dropdown menu for selecting planets
const planetMenu = document.createElement('select');
planetMenu.style.position = 'absolute';
planetMenu.style.top = '10px';
planetMenu.style.right = '10px';
planetMenu.style.zIndex = '1000';
planetMenu.style.padding = '10px';
planetMenu.style.fontFamily = 'Orbitron, sans-serif';
planetMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
planetMenu.style.color = 'white';
planetMenu.style.border = '1px solid white';
planetMenu.style.borderRadius = '5px';
const placeholderOption = document.createElement('option');
placeholderOption.value = '';
placeholderOption.innerText = 'Select a Planet';
placeholderOption.disabled = true;
placeholderOption.selected = true;
planetMenu.appendChild(placeholderOption);



// Populate the dropdown menu with planet options
planetNames.forEach((planetName, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.innerText = planetName.charAt(0).toUpperCase() + planetName.slice(1);
    planetMenu.appendChild(option);
});

document.body.appendChild(planetMenu);

// Function to handle planet selection from the dropdown menu
function handlePlanetSelection() {
    const selectedIndex = planetMenu.value;
    const selectedPlanet = planets[selectedIndex];

    // Set target planet for the camera to follow
    targetPlanet = selectedPlanet;
    isFollowingPlanet = true;

    // Disable OrbitControls while following the planet
    orbit.enabled = false;

    // Show the reset button
    resetButton.style.display = 'block';
    resetButton.style.zIndex = '1000';
    resetButton.style.borderRadius = '5px';
    resetButton.style.padding = '10px';
    resetButton.style.fontFamily = 'Orbitron, sans-serif';
    

    // Show information box
    showInfoBox(planetNames[selectedIndex]);
}

// Add event listener to dropdown menu
planetMenu.addEventListener('change', handlePlanetSelection);

// Hide the dropdown menus initially
viewMenu.style.display = 'none';
speedMenu.style.display = 'none';
planetMenu.style.display ='none';

// Show dropdown menus when start button is clicked
startButton.addEventListener('click', function() {
    startMenu.classList.add('hidden'); 
    viewMenu.style.display = 'block';
    speedMenu.style.display = 'block';
    planetMenu.style.display = 'block';
});