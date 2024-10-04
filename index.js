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
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.5,
        metalness: 0.1 
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);

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
