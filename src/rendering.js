import * as THREE from 'three';
// import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { Algorithms } from './algorithms'

const GAP_BETWEEN_BARS = 1;
const BAR_WIDTH = 2;
// ms between each update in sorting anim
let DELAY_MS = 16;

// don't update bars
let haltAnimate = false;

// user cannot start sort during another sort
let isSorting = false;

const container = document.body;

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //FOV, aspect ratio, near, far clip plane

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const rendererDom = container.appendChild(renderer.domElement);

let boxGeometry = new THREE.BoxGeometry(BAR_WIDTH, 1, 1);

// const materials = {
//   red: new THREE.MeshBasicMaterial({ color: 0xee3333}),
//   green: new THREE.MeshBasicMaterial({ color: 0x33ee33 }),
//   blue: new THREE.MeshBasicMaterial({ color: 0x3333ee }),
//   purple: new THREE.MeshBasicMaterial({ color: 0xcc33ee }),
// };
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xee3333 }), //red
  new THREE.MeshBasicMaterial({ color: 0x33ee33 }), //green
  new THREE.MeshBasicMaterial({ color: 0x3333ee }), //blue
  new THREE.MeshBasicMaterial({ color: 0xcc33ee }), //purple
  new THREE.MeshBasicMaterial({ color: 0xeecc33 }), //yellow
];
// let cube = new THREE.Mesh(boxGeometry, material);

const controls = new OrbitControls(camera, renderer.domElement);
// camera.position = new THREE.Vector3(0, 2, 5);
camera.position.set(0, 2, 5);

Algorithms.init();
const data = Algorithms.data;

// meshes of bars
const bars = [];
let gapAndWidth = GAP_BETWEEN_BARS + BAR_WIDTH;
for(let i = 0; i < Algorithms.totalPiecesOfData; i++) {
  let b = new THREE.Mesh(boxGeometry, materials[1]);
  b.scale.y = data[i];
  b.position.x = i * gapAndWidth;
  bars.push(b);
  scene.add(b);
}

// fps display
const stats = new Stats();
const statsDom = container.appendChild(stats.dom);

// GUI
// let params = {

// };
// let gui = new GUI();


// buttons
const buttonContainer = document.getElementsByClassName("buttons-container")[0];

// create a button with text 'Xyz Sort' and on clicked, calls Algorithms.xyzSort();
let createButton = (type) => {
  const b = document.createElement('button');
  // text for button
  const sortDisplayName = type.charAt(0).toUpperCase() + type.substring(1) + " Sort";

  b.setAttribute('id', type);
  b.innerHTML = sortDisplayName;
  b.onclick = () => startSortOfType(type);
  buttonContainer.appendChild(b);
};

createButton('bubble');
createButton('merge');
createButton('quick');

// randomize data button
document.getElementById('randomize-button').onclick = (e) => {
  Algorithms.fillWithRandomData();
  hasDataBeenRandomized = true;
};

// test to see if algorithms are working
document.getElementById('test-button').onclick = (e) => {
  let fails = [];
  const types = ['bubble', 'merge', 'quick']

  for(let t of types) fails.push([]);

  for(let i = 0; i < 100; i++) {
    for(let j = 0; j < types.length; j++) {
      Algorithms.fillWithRandomData();
      const type = types[j];
      let arr = Algorithms.data.slice().sort((a, b) => a - b);
      Algorithms[type + "Sort"]();
      for(let k = 0; k < arr.length; k++) {
        if(arr[k] !== Algorithms.data[k]) {
          fails[j].push(`${type} Sort fail ${arr.toString()} | ${Algorithms.data.toString()}`);
          break;
        }
      }
    }
  }

  for(let i = 0; i < types.length; i++) {
    console.log(`${types[i]} Sort had ${fails[i].length} fails.`)
    for(let j = 0; j < fails[i].length; j++) {
      console.log(fails[i][j]);
    }
  }
};

// input (numbers)
const posIntOverZero = /^[1-9]\d*$/;
// previous values to restore to if input invalid
let lastBarCount = 12;
let lastDelay = 16;

const barCountInput = document.getElementById('bar-count');
const delayInput = document.getElementById('delay');

const barCountHandler = (e) => {
  const newValue = e.target.value;

  // check to see if value (int > 0)
  if(newValue.length === 0 || posIntOverZero.test(newValue)) {
    // convert to int, clamp, and set
    const newInt = Math.min(parseInt(newValue), 1000);
    lastBarCount = newInt;
    barCountInput.value = newInt;

    return;
  }

  // revert the value to the last valid one
  barCountInput.value = lastBarCount;
}

const barCountSubmitHandler = (e) => {
  if(!!e.key && e.key !== 'Enter') return;
  if(e.target.value.length === 0) return;

  const newValue = parseInt(e.target.value);
  if(newValue === bars.length) return;

  haltAnimate = true;

  Algorithms.totalPiecesOfData = newValue;
  Algorithms.fillWithRandomData();
  
  // clear scene and bars array
  for(let b of bars) {
    scene.remove(b);
    console.log('re');
    b.geometry.dispose();
    b.material.dispose();
    b = undefined;
  }
  // scene = scene.remove(bars);
  bars.splice(0, bars.length);
  console.log(bars);
  // reconstruct meshes
  for(let i = 0; i < Algorithms.totalPiecesOfData; i++) {
    let b = new THREE.Mesh(boxGeometry, materials[1]);
    b.scale.y = data[i];
    b.position.x = i * gapAndWidth;
    bars.push(b);
    scene.add(b);
  }

  haltAnimate = false;
}

barCountInput.addEventListener('input', barCountHandler);
barCountInput.addEventListener('propertychange', barCountHandler);
barCountInput.addEventListener('keyup', barCountSubmitHandler);
barCountInput.addEventListener('blur', barCountSubmitHandler);


const delayHandler = (e) => {
  const newValue = e.target.value;

  // check to see if valie (int > 0)
  if(posIntOverZero.test(newValue)) {
    // convert to int, clamp, and set
    const newInt = Math.min(parseInt(newValue), 100);
    lastDelay = newInt;
    delayInput.value = newInt;

    return;
  }

  // revert the value to the last valid one
  delayInput.value = lastDelay;
}

const delaySubmitHandler = (e) => {
  if(e.key !== 'Enter') return;

  const newValue = parseInt(e.target.value); 
  DELAY_MS = newValue;
}

delayInput.addEventListener('input', delayHandler);
delayInput.addEventListener('propertychange', delayHandler);
delayInput.addEventListener('keyup', delaySubmitHandler);
delayInput.addEventListener('blur', delaySubmitHandler);



// only randomize the data set is it is already sorted and the user hasn't manually randomized it
let hasDataBeenRandomized = true;

function startSortOfType(sort){
  if(isSorting) return;
  isSorting = true;

  if(!hasDataBeenRandomized) {
    Algorithms.fillWithRandomData();

    // make sure to update all the bars because render hasn't been called
    for(let i = 0; i < Algorithms.totalPiecesOfData; i++) {
      if(bars[i].scale.y !== data[i]) 
        bars[i].scale.y = data[i];
    }
  }

  // the name of the sort (ex: merge -> mergeSort)
  // const algo = Algorithms[sort + "Sort"];
  Algorithms[sort + "Sort"]();

  // animate
  animStarted = true;
  doAnimationsAsync(Algorithms.animations);
}



//has algorithm anim started?
let animStarted = false;


//success animation
function successFlashes() {
  const flashMat = materials[2];
  
  //change color of each bar one by one by increasing delay for each one
  for(let i = 0; i < bars.length; i++){
    let bar = bars[i];
    setTimeout(() => {
      bar.material = flashMat;
    }, i * DELAY_MS);
  }

  //reset all colors
  return new Promise(resolve => {  
    setTimeout(() => {
      resolve();
    }, bars.length * DELAY_MS);
  });
}

async function playSuccess() {

  //wait for all the bars to light up
  await successFlashes();
  for(let i = 0; i < bars.length; i++){
    bars[i].material = materials[1];
  }

  // give control back to user
  animStarted = false;
  isSorting = false;
  hasDataBeenRandomized = false;
}

// delay function for ms
function waitMs(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

// do animation async
async function doAnimationsAsync(anims) {
  if(anims.length === 0) return;

  // the animations need to be visible, so if the delay is too lower than 1/60, than set it to 1/60
  // we want the color flashing to be visible for at least one frame
  const ANIM_DELAY = Math.max(DELAY_MS, 17);

  for(let i = 0; i < anims.length; i++) {
    let anim = anims[i];

    const ANIMTYPE = Algorithms.ANIMATION_TYPE;
    // handle the anim
    switch(anim.animType){
      case ANIMTYPE.resetColor:
        // for each index, set color to green
        for(let i of anim.inds){
          if(i >= 0 && i < bars.length)
            bars[i].material = materials[1];
        }
        break;

      case ANIMTYPE.flashColor:
        // for each index, set color to col
        if(anim.col === undefined || anim.col >= materials.length) throw `Material of index ${anim.col} does not exist. The highest is ${materials.length - 1}`;
        for(let i of anim.inds) {
          if(i < 0 || i >= bars.length) continue;
          
          bars[i].material = materials[anim.col];

          // remember to set them back after
          setTimeout(() => { bars[i].material = materials[1] }, ANIM_DELAY);
        }
        break;

      case ANIMTYPE.swap:
        if(anim.inds[0] < 0 || anim.inds[0] >= bars.length || anim.inds[1] < 0 || anim.inds[1] >= bars.length) break;

        // swap two bars (swap heights) also set color
        let i1 = anim.inds[0];
        let i2 = anim.inds[1];
        let b1 = bars[i1].scale.y;
        bars[i1].scale.y = bars[i2].scale.y;
        bars[i2].scale.y = b1;
        bars[i1].material = materials[3]
        bars[i2].material = materials[3];

        // set back to normal color
        setTimeout(() => { bars[i1].material = materials[1] ; bars[i2].material = materials[1] }, ANIM_DELAY);

        break;

      // set the height (and flash a color) or set just the color (doesn't revert automatically after ANIM_DELAY)
      case ANIMTYPE.set:
        if (anim.ind < 0 || anim.ind >= bars.length) break;
        // change color and set height
        if(anim.val !== undefined) {
          bars[anim.ind].scale.y = anim.val;
          bars[anim.ind].material = materials[2];

          setTimeout(() => { bars[anim.ind].material = materials[1] }, ANIM_DELAY);
        }
        else {
          bars[anim.ind].material = materials[anim.col];
        }

        break;

      case ANIMTYPE.finished:
        // run through all the bars, top to bottom
        playSuccess();

        break;

      default:
        console.log(`animation ${anim.animType} does not exist`)
        break;
    }

    // wait for some time
    await waitMs(DELAY_MS);
    
  }
}

function animate() {
  requestAnimationFrame(animate);

  // is there an anim running now? (have we started a sort)
  if(animStarted === true){
    // let animations = Algorithms.animations;
    // for(anim of animations){
    // if(Algorithms.animations.length == 0) return;

    // if(animCounter >= Algorithms.animations.length) {
    //   animStarted = false;
    //   animCounter = 0;
    //   return;
    // }
    
    
  }
  else{
    if(haltAnimate) return;
    for(let i = 0; i < Algorithms.totalPiecesOfData; i++) {
      if(bars[i] !== undefined && bars[i].scale.y !== data[i]) 
        bars[i].scale.y = data[i];
    }
  }

  //update the orbitcontrols and fps
  controls.update();
  stats.update();

  renderer.render(scene, camera);
}

animate();
