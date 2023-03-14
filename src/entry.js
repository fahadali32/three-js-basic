import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { Matrix3, Mesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import studio from '@theatre/studio'
// studio.initialize()
const scene = new THREE.Scene();
const backgroundColor = 0xf1f1f1;

// Init the scene
scene.background = new THREE.Color(backgroundColor);
scene.fog = new THREE.Fog(backgroundColor, 60, 100);

const hemiLight = new THREE.HemisphereLight(0x938b8b);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 10, 10);
light.castShadow = true;
light.shadow.camera.top = 2;
light.shadow.camera.bottom = -2;
light.shadow.camera.left = -2;
light.shadow.camera.right = 2;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 40;
scene.add(light);

const loader = new GLTFLoader();
// const helper = new THREE.DirectionalLightHelper( light, 5 );
const gridHelper = new THREE.GridHelper();
scene.add(gridHelper);
scene.add(new THREE.AxesHelper(5));
//gives use axes

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const gui = new GUI();
camera.position.z = 3;
camera.position.y = 2;

const canvas = document.getElementById("myCanvas");
//For maintining the pixel ration should enable the antialias: true
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement);
//controls.addEventListener('change', render)
var sgeometry = new THREE.PlaneGeometry(7, 5, 3);
var smaterial = new THREE.MeshBasicMaterial({ color: "0xfffff" });
const play = new Mesh(sgeometry, smaterial);
scene.add(play);
play.material.color.setHex(0xa5b8c9);
play.position.z = -0.99;
play.rotation.x = -Math.PI / 2;

let mixer;
let leftArmBone;

const options = {
  palette: ["#ffffff"],
};
const color = new THREE.Color(hemiLight.color);
const hemiFolder = gui.addFolder("Hemisphere Light");
hemiFolder
  .addColor({ color: color.getHex() }, "color", options)
  .onChange((value) => {
    hemiLight.color.set(value);
  });

const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "x", -100, 100, 0.01);
cameraFolder.add(camera.position, "y", -100, 100, 0.01);
cameraFolder.add(camera.position, "z", -100, 100, 0.01);
cameraFolder.add(camera.rotation, "x", -100, 100, 0.01);
cameraFolder.add(camera.rotation, "y", -100, 100, 0.01);
cameraFolder.add(camera.rotation, "z", -100, 100, 0.01);

const lightFolder = gui.addFolder("THREE.Light");
lightFolder.add(light.position, "x", -100, 100, 0.01);
lightFolder.add(light.position, "y", -100, 100, 0.01);
lightFolder.add(light.position, "z", -100, 100, 0.01);

const planeFolder = gui.addFolder("Playground");
planeFolder.add(play.position, "x", -100, 100, 0.01);
planeFolder.add(play.position, "y", -100, 100, 0.01);
planeFolder.add(play.position, "z", -100, 100, 0.01);
planeFolder.add(play.rotation, "x", -100, 100, 0.01);
planeFolder.add(play.rotation, "y", -100, 100, 0.01);
planeFolder.add(play.rotation, "z", -100, 100, 0.01);


loader.load(
  "Xbot.glb",
  function (gltf) {
    scene.add(gltf.scene);
    const model = gltf.scene;
    mixer = new THREE.AnimationMixer(gltf.scene);
    // console.log(mixer);
    const clips = gltf.animations;

    model.traverse((object) => {
      // console.log(object); // Log the name of each bone
    });

    //Visualize the bone and add into the scene ;Never Forget to add root bones name in the SkeletonHelper
    const bones = model.getObjectByName("mixamorigHips");
    const bonHelper = new THREE.SkeletonHelper(bones);
    scene.add(bonHelper);

    //declare other bones foun those after uploading the model in the threejs editor
    const spinal = model.getObjectByName("mixamorigSpine");
    console.log(spinal.parent.position);

    // rightArm = model.getObjectByName("mixamorigLeftArm");
    leftArmBone = model.getObjectByName("mixamorigLeftArm");

    // Create dat.gui controls for left arm rotation
    
    const leftArmFolder = gui.addFolder("Left Arm Control");
    const leftArmRotation = {
      x: 0,
      y: 0,
      z: 0,
    };
    leftArmFolder
      .add(leftArmRotation, "x", -Math.PI, Math.PI)
      .name("Rotation X");
    leftArmFolder
      .add(leftArmRotation, "y", -Math.PI, Math.PI)
      .name("Rotation Y");
    leftArmFolder
      .add(leftArmRotation, "z", -Math.PI, Math.PI)
      .name("Rotation Z");

    // Animate the scene
    function animate() {
      requestAnimationFrame(animate);
      // Update left arm bone rotation based on dat.gui values
      leftArmBone.rotation.x = leftArmRotation.x;
      leftArmBone.rotation.y = leftArmRotation.y;
      leftArmBone.rotation.z = leftArmRotation.z;

      // Render scene
      renderer.render(scene, camera);

      // Call animate() again on next frame
      
    }

    // Start the animation loop
    animate();

    //clips name
    const clip = THREE.AnimationClip.findByName(clips, "idle");
    const idle = THREE.AnimationClip.findByName(clips, "idle");
    const run = THREE.AnimationClip.findByName(clips, "run");
    const walk = THREE.AnimationClip.findByName(clips, "walk");
    // clip.name = 'agree'
    const animationsFolder = gui.addFolder("Animations");
    const state = {
      clipName: "idle",
    };
    const clipss = {
      idle: idle,
      run: run,
      walk: walk,
    };
    const clipController = animationsFolder.add(
      state,
      "clipName",
      Object.keys(clipss)
    );
    clipController.onChange((clipName) => {
      // console.log(clipName);
      const clip = clipss[clipName];
      // console.log(clip);
      mixer.stopAllAction();
      mixer.clipAction(clip).play();
    });

    const action = mixer.clipAction(clip);
    action.play();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);


// rightArm.rotation.x = leftArmRotation.x;
// rightArm.rotation.y = leftArmRotation.y;
// rightArm.rotation.z = leftArmRotation.z;
// console.log(rightArm);

// const geometry = new THREE.BoxGeometry()
// const material = new THREE.MeshStandardMaterial({
//     color:"blue",
// })

// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);


// const cubeFolder = gui.addFolder('Cube')
// const cubeRotationFolder = cubeFolder.addFolder('Rotation')
// cubeRotationFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
// cubeRotationFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
// cubeRotationFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
// cubeFolder.open()
// cubeRotationFolder.open()
// const cubePositionFolder = cubeFolder.addFolder('Position')
// cubePositionFolder.add(cube.position, 'x', -10, 10, 2)
// cubePositionFolder.add(cube.position, 'y', -10, 10, 2)
// cubePositionFolder.add(cube.position, 'z', -10, 10, 2)
// cubeFolder.open()
// cubePositionFolder.open()
// const cubeScaleFolder = cubeFolder.addFolder('Scale')
// cubeScaleFolder.add(cube.scale, 'x', -5, 5)
// cubeScaleFolder.add(cube.scale, 'y', -5, 5)
// cubeScaleFolder.add(cube.scale, 'z', -5, 5)
// cubeFolder.add(cube, 'visible')
// cubeFolder.open()
// cubeScaleFolder.open()
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  
  //stats.begin()
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
  //stats.end()
  const t = clock.getElapsedTime();

  if (leftArmBone) {
    // leftArmBone.rotation.x += 0.01;
    leftArmBone.rotation.z += 0.01;
    // rightArm.rotation.z += Math.sin(t);
  }

  if (mixer) {
    mixer.update(clock.getDelta());
  }

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
//render()

// Set up the ThreeJS scene and load your 3D model
