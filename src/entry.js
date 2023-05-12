import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { Matrix3, Mesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import studio from '@theatre/studio'
import { getProject } from '@theatre/core'

//theatrejs config
studio.initialize()
const config = {}
const project = getProject('My Project', config)
const sheet = project.sheet("scene")
const box = sheet.object("Box",{
  position:{
    x:0,
    y:0,
    z:0,
  } 

})

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

let mixer,model;
let leftArmBone;

loader.load(
  "Xbot.glb",
  function (gltf) {
    
    scene.add(gltf.scene);
    model = gltf.scene;
    
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
    var leftArmBone = model.getObjectByName("mixamorigLeftArm");

    box.onValuesChange((newVal)=>{
      // leftArmBone.rotation.x = newVal.x
      console.log(leftArmBone.rotation.x);
      leftArmBone.rotation.x
      leftArmBone.rotation.x = newVal.position.x
      function animate() {
        requestAnimationFrame(animate);
        // console.log(newVal.x);
        leftArmBone.rotation.x = newVal.position.x
        renderer.render(scene, camera);
      
        stats.update();
      }
      animate()
    })

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
    // action.setLoop(THREE.LoopRepeat);
    action.play();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);



window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);


const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

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
