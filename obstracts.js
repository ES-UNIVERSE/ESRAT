// Import Three.js and GLTFLoader from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.141.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/loaders/GLTFLoader.js';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('model-container').appendChild(renderer.domElement);

// Load the 3D model
const loader = new GLTFLoader();
loader.load('img/spaceship1.glb', function (gltf) {
    const spaceship = gltf.scene;
    scene.add(spaceship);
    spaceship.position.set(0, 0, 0);
    spaceship.scale.set(1, 1, 1); // Adjust scale if needed

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (spaceship) {
            spaceship.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
    }
    animate();
}, undefined, function (error) {
    console.error('An error happened:', error);
});

// Set the camera position
camera.position.z = 5;

// Handle window resizing
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
