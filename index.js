import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

const textures = [];
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const starsTexture = textureLoader.load('/img/stars.jpg');
const sunTexture = textureLoader.load('/img/sun.jpg');

const mercuryTexture = textureLoader.load('/img/mercury.jpg');
const venusTexture = textureLoader.load('/img/venus.jpg');
const earthTexture = textureLoader.load('/img/earth.jpg');
const marsTexture = textureLoader.load('/img/mars.jpg');
const jupiterTexture = textureLoader.load('/img/jupiter.jpg');
const saturnTexture = textureLoader.load('/img/saturn.jpg');
const saturnRingTexture = textureLoader.load('/img/saturn ring.png');
const uranusTexture = textureLoader.load('/img/uranus.jpg');
const uranusRingTexture = textureLoader.load('/img/uranus ring.png');
const neptuneTexture = textureLoader.load('/img/neptune.jpg');
const plutoTexture = textureLoader.load('/img/pluto.jpg');


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

textures.forEach(function(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
});

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');


startButton.addEventListener('click', function() {
    startMenu.classList.add('hidden'); 
});


const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(-90, 140, 140);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 30000, 300);
scene.add(pointLight);

scene.background = starsTexture;

const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: sunTexture
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanet(size, texture, position, ring) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
      map: texture
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    if (ring) {
      const ringGeo = new THREE.RingGeometry(
        ring.innerRadius,
        ring.outerRadius,
        32
      );
      const ringMat = new THREE.MeshBasicMaterial({
        map: ring.texture,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      obj.add(ringMesh);
      ringMesh.position.x = position;
      ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    mesh.position.x = position;
    return { mesh, obj };
}

const mercury = createPlanet(3.2, mercuryTexture, 28);
const venus = createPlanet(5.8, venusTexture, 44);
const earth = createPlanet(6, earthTexture, 62);
const mars = createPlanet(4, marsTexture, 78);
const jupiter = createPlanet(12, jupiterTexture, 100);
const saturn = createPlanet(10, saturnTexture, 138, {
  innerRadius: 10,
  outerRadius: 20,
  texture: saturnRingTexture
});
const uranus = createPlanet(7, uranusTexture, 176, {
  innerRadius: 7,
  outerRadius: 12,
  texture: uranusRingTexture
});
const neptune = createPlanet(7, neptuneTexture, 200);
const pluto = createPlanet(2.8, plutoTexture, 216);

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
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});