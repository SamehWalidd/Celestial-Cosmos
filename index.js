import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { fetchLimitedData } from './api.js';

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
const cometTexture = textureLoader.load('./img/comet.jpg');

const cometsColors = [
    0xff5733,
    0x33c1ff,
    0x8cff33,
    0xff33d1,
    0xffe633,
    0x33ffbd,
    0xbf33ff,
    0x337bff,
    0xffa833,
    0x33ff57
]

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
    plutoTexture,
    cometTexture
);

const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', function() {
    startMenu.classList.add('hidden'); 
});

textures.forEach(function(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-200, 100, 200); // Adjusted camera position for better view
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 30000, 300);
scene.add(pointLight);

// You can also add a directional light for better shadows and highlights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Adjusted intensity
directionalLight.position.set(100, 100, 100); // Positioning it away from the planets
scene.add(directionalLight);

scene.background = starsTexture;

// Create Sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Calculate Comet Position Function
function calculateCometPosition(comet) {
    const e = parseFloat(comet.e); // Eccentricity
    const q = parseFloat(comet.q_au_1); // Perihelion distance
    const i = parseFloat(comet.i_deg) * (Math.PI / 180); // Inclination in radians
    const w = parseFloat(comet.w_deg) * (Math.PI / 180); // Argument of periapsis in radians
    const Ω = parseFloat(comet.node_deg) * (Math.PI / 180); // Longitude of ascending node in radians
    const M = 0; // Mean anomaly

    // Calculate semi-major axis
    const a = q / (1 - e);

    // Calculate eccentric anomaly (using a simplified method)
    const eccentricAnomaly = M + (e * Math.sin(M)); // This is a simplification

    // Calculate position in the orbital plane
    const x0 = a * (Math.cos(eccentricAnomaly) - e);
    const y0 = a * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);

    // Rotate into 3D space using inclination and longitude
    const x = x0 * (Math.cos(Ω) * Math.cos(w) - Math.sin(Ω) * Math.sin(w) * Math.cos(i));
    const y = x0 * (Math.sin(Ω) * Math.cos(w) + Math.cos(Ω) * Math.sin(w) * Math.cos(i));
    const z = x0 * (Math.sin(w) * Math.sin(i));

    return { x, y, z };
}

// Add Comets to Scene
async function addCometsToScene() {
  const cometData = await fetchLimitedData();

cometData.forEach(comet => {
    console.log('Comet Entry:', comet); // Log each comet entry

    // Calculate position
    const position = calculateCometPosition(comet);
    console.log('Calculated Position:', position); // Log the calculated

    // Scale the position for visibility
    const scaleFactor = 100; // Adjust this factor as necessary
    const scaledPosition = {
        x: position.x * scaleFactor,
        y: position.y * scaleFactor,
        z: position.z * scaleFactor,
    };

    // Create an Object3D for the comet
    const cometOrbit = new THREE.Object3D(); // Parent object to control orbit
    scene.add(cometOrbit); // Add to scene

    // Create the comet mesh with increased size
    const cometGeometry = new THREE.SphereGeometry(1, 16, 16); // Increased size for visibility
    const cometColor = cometsColors[Math.floor(Math.random() * cometsColors.length)];
    const cometMaterial = new THREE.MeshStandardMaterial({ color: cometColor, emissive: cometColor, emissiveIntensity: 10 });
    const cometMesh = new THREE.Mesh(cometGeometry, cometMaterial);

    // Create a cylindrical ray shooting out from a comet
    function createCometRay(cometPosition, directionVector, rayLength, rayWidth) {
        // Create a cylinder geometry
        const rayGeometry = new THREE.CylinderGeometry(rayWidth, rayWidth, rayLength, 8);

        // Create a material for the ray (semi-transparent for visual effect)
        const rayMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00,    // Yellow color (can change based on preference)
            transparent: true,
            opacity: 0.7
        });

        // Create the ray mesh
        const rayMesh = new THREE.Mesh(rayGeometry, rayMaterial);

        // Position the ray at the comet's position
        rayMesh.position.copy(cometPosition);

        // Adjust the ray's origin so it extends outward from the comet
        rayMesh.position.add(directionVector.clone().multiplyScalar(rayLength / 2));

        // Rotate the ray to point in the correct direction (from the comet)
        rayMesh.lookAt(cometPosition.clone().add(directionVector));

        return rayMesh;
    }

    // Example usage
    const cometPosition = new THREE.Vector3(scaledPosition.x, scaledPosition.y, scaledPosition.z); // Comet's position
    const rayDirection = new THREE.Vector3(1, 0.5, -0.5).normalize(); // Direction of the ray

    // Create a ray extending 100 units in length and 2 units in width
    const cometRay = createCometRay(cometPosition, rayDirection, 3 , 0.5);

    // Add the ray to the scene
    cometOrbit.add(cometRay);

    // Set the initial position of the comet relative to the orbit
    cometMesh.position.set(scaledPosition.x, scaledPosition.y, scaledPosition.z);
    cometOrbit.add(cometMesh); // Add the comet mesh to the orbit object

    // Set the initial position of the cometOrbit
    cometOrbit.position.set(0, 0, 0); // Centered around the sun
});
}

// Call the function to add comets after the initial setup
addCometsToScene().catch(console.error);

// Create Planet Function
function createPlanet(size, texture, distance, ring) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.5, // Adjust roughness for realism
      metalness: 0.1 // Adjust metalness if needed
  });
  const mesh = new THREE.Mesh(geo, mat);
  const obj = new THREE.Object3D();
  obj.add(mesh);

  if (ring) {
      const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
      const ringMat = new THREE.MeshBasicMaterial({ map: ring.texture, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -0.5 * Math.PI;
      ringMesh.position.x = distance; // Position the ring at the same distance as the planet
      obj.add(ringMesh); // Add the ring to the planet's Object3D
  }

  mesh.position.x = distance; // Set distance from sun
  scene.add(obj);

  return { mesh, obj };
}

// Create Planets
const mercury = createPlanet(2, mercuryTexture, 28);
const venus = createPlanet(4, venusTexture, 44);
const earth = createPlanet(4.5, earthTexture, 62);
const mars = createPlanet(3, marsTexture, 78);
const jupiter = createPlanet(8, jupiterTexture, 100);
const saturn = createPlanet(6, saturnTexture, 138, {
    innerRadius: 7,
    outerRadius: 12,
    texture: saturnRingTexture
});
const uranus = createPlanet(5, uranusTexture, 176, {
    innerRadius: 4,
    outerRadius: 9,
    texture: uranusRingTexture
});
const neptune = createPlanet(5, neptuneTexture, 200);
const pluto = createPlanet(2, plutoTexture, 216);

// Animate Function

function animate() {
  sun.rotateY(0.004);
  mercury.mesh.rotateY(0.004);
  venus.mesh.rotateY(0.002);
  earth.mesh.rotateY(0.02);
  mars.mesh.rotateY(0.018);
  jupiter.mesh.rotateY(0.04);
  saturn.mesh.rotateY(0.038);
  uranus.mesh.rotateY(0.03);
  neptune.mesh.rotateY(0.032);
  pluto.mesh.rotateY(0.008);

  mercury.obj.rotateY(0.04);
  venus.obj.rotateY(0.015);
  earth.obj.rotateY(0.01);
  mars.obj.rotateY(0.008);
  jupiter.obj.rotateY(0.002);
  saturn.obj.rotateY(0.0009);
  uranus.obj.rotateY(0.0004);
  neptune.obj.rotateY(0.0001);
  pluto.obj.rotateY(0.00007);

  // Add comet rotations around the sun
  scene.children.forEach(child => {
      if (child instanceof THREE.Object3D && child.children.length > 0) {
          child.rotateY(0.01); // Adjust rotation speed as needed
      }
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
