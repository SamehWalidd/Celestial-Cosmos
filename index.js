import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

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
const plutoTexture = textureLoader.load('./img/pluto.jpg');

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
    plutoTexture
);

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

const pointLight = new THREE.PointLight(0xffffff, 30000, 300);
scene.add(pointLight);

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
const pluto = createPlanet(2, plutoTexture, 216, 0.015);

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
resetButton.style.top = '10px';
resetButton.style.right = '10px';
resetButton.style.display = 'none'; // Initially hidden
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

        // Show the reset button
        resetButton.style.display = 'block';
    }
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

// Show information box
function showInfoBox(planet, event) {
    fetchPlanetInfo(planet).then(data => {
      // Set the innerHTML content with planet information
      infoBox.innerHTML = `
        <h3>${data.name}</h3>
        <p>Brief: ${data.overview.content}</p>
        <p>Radius: ${data.radius}</p>
        <p>Revolution: ${data.revolution}</p>
        <p>Rotation: ${data.rotation}</p>
        <p>Temperature: ${data.temperature}</p>
      `;
  
      // Apply CSS styles directly in the JavaScript
      infoBox.style.position = 'fixed';
      infoBox.style.display = 'flex';
      infoBox.style.flexDirection = 'column';
      infoBox.style.alignItems = 'center';
      infoBox.style.justifyContent = 'center';
      infoBox.style.gap = '10px';

      infoBox.style.top = '0'; // Start at the top of the page
      infoBox.style.left = '0'; // Align to the left of the viewport
      infoBox.style.width = '25%'; // Width of the info box
      infoBox.style.height = '100vh'; // Full height of the viewport
      infoBox.style.padding = '20px';
      infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Dark transparent background
      infoBox.style.color = '#fff'; // White text color
      infoBox.style.borderRadius = '0'; // No border radius for full-height design
      infoBox.style.fontFamily = 'Orbitron, sans-serif';
      infoBox.style.fontSize = '14px';
      infoBox.style.boxShadow = '2px 0 10px rgba(0, 0, 0, 0.5)'; // Shadow on the right
      infoBox.style.zIndex = '1000'; // Make sure it appears above other elements
      infoBox.style.overflowY = 'auto'; // Enable vertical scrolling if content overflows
      
    });
  }
  

// Hide information box
function hideInfoBox() {
  infoBox.style.display = 'none';
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