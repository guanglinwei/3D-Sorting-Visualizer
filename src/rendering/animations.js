import { Algorithms } from '../algorithms';
import { Buttons } from '../buttons';
import { Test } from '../testSorts';


export const GLOBALS = {
    // ms between each update in sorting anim
    DELAY_MS: 16,

    // don't update bars
    HALT_ANIMATE: false,

    // user cannot start sort during another sort
    IS_SORTING: false,

    // whether or not an animation is in progress (NOTE: might combine with is_sorting)
    ANIM_STARTED: false,

    // data should be randomized before sorting. if not, then randomize before
    IS_DATA_RANDOMIZED: false,
};

// holds all anims, filled in algorithms.js
export const ANIMATIONS = [];

export const ANIMATION_TYPE = {
    //back to default color
    resetColor: 0,

    //change the color then change back after small delay
    flashColor: 1,

    //swap positions of two bars
    swap: 2,

    //set height/col of bar
    set: 3,

    //run through all elements when done
    finished: 4
};

export const COLORS = {
    DEFAULT: 'LimeGreen',
    FLASH: 'Tomato',
    HIGHLIGHT: 'Gold',
    SWAP: 'DarkMagenta',
    DONE: 'DodgerBlue',
};

// index -> COLORS.foo, because algorithms return numbers
export const ID_TO_COLOR = [];
const _k = Object.keys(COLORS);
for(let i = 0; i < _k.length; i++) {
    ID_TO_COLOR[i] = _k[i];
}



Algorithms.init();
const DATA = Algorithms.data;
const BARS = [];

// make bars (elements with class bar)
const BAR_CONTAINER = document.getElementById('bars-container');
remakeBars();

// make all buttons
Buttons.createAll(GLOBALS);
Test.setup();


export function remakeBars() {
    // delete all current bars
    while(BAR_CONTAINER.firstChild) {
        BAR_CONTAINER.removeChild(BAR_CONTAINER.firstChild);
    }
    BARS.splice(0, BARS.length);

    // create new bars
    for(let i = 0; i < Algorithms.totalPiecesOfData; i++) {
        const el = document.createElement('div');
        el.className = 'bar';
        el.style.backgroundColor = COLORS.DEFAULT;
        el.style.height = Algorithms.data[i] + "px";
        BARS.push(el);
        BAR_CONTAINER.appendChild(el);
    }

    BAR_CONTAINER.style.paddingLeft = ((document.body.clientWidth - 3 * BARS.length) / 2).toString() + "px";
    console.log(BAR_CONTAINER.style.paddingLeft);
}

function printArr(arr) {
    let s = "";
    for(const a of arr) {
        s += a + " ";
    }

    console.log(s);
}

// anims = []
// set in algorithms.js
export async function doAnimationsAsync(anims) {
    if(anims.length === 0) return;
  
    // the animations need to be visible, so if the delay is too lower than 1/60, than set it to 1/60
    // we want the color flashing to be visible for at least one frame
    const ANIM_DELAY = Math.max(GLOBALS.DELAY_MS, 17);
  
    for(let i = 0; i < anims.length; i++) {
        let anim = anims[i];

        // handle the anim
        switch(anim.animType) {
            // back to default
            case ANIMATION_TYPE.resetColor:

                // for each index, set color to default
                for(let i of anim.inds){
                    if(i >= 0 && i < BARS.length)
                    setBarColor(i, COLORS.DEFAULT);
                }

                break;
  
            // any color for short time
            case ANIMATION_TYPE.flashColor:

                // for each index, set color to col
                if(anim.col === undefined || anim.col >= COLORS.length) throw `Color of index ${anim.col} does not exist. The highest is ${COLORS.length - 1}`;
                for(let i of anim.inds) {
                    if(i < 0 || i >= BARS.length) continue;
                    
                    setBarColor(i, anim.col);
        
                    // remember to set them back after
                    setTimeout(() => { setBarColor(i, COLORS.DEFAULT) }, ANIM_DELAY);
                }

                break;
    
            // switch two heights, flash color
            case ANIMATION_TYPE.swap:

                if(anim.inds[0] < 0 || anim.inds[0] >= BARS.length || anim.inds[1] < 0 || anim.inds[1] >= BARS.length) break;
        
                // swap two BARS (swap heights) also set color
                let i1 = anim.inds[0];
                let i2 = anim.inds[1];
                let b1 = getBarHeight(i1);
                setBarHeight(i1, getBarHeight(i2));
                setBarHeight(i2, b1);
                setBarColor(i1, COLORS.SWAP);
                setBarColor(i2, COLORS.SWAP);
        
                // set back to normal color
                setTimeout(() => {
                    setBarColor(i1, COLORS.DEFAULT);
                    setBarColor(i2, COLORS.DEFAULT);
                }, ANIM_DELAY);
        
                break;
    
            // set the height (and flash a color) or set just the color (doesn't revert automatically after ANIM_DELAY)
            // to set height, anim = { val: num }
            // to set color, anim = { col: ind }
            case ANIMATION_TYPE.set:
                if (anim.ind < 0 || anim.ind >= BARS.length) break;
                // change color and set height
                if(anim.val !== undefined) {
                    setBarHeight(anim.ind, anim.val);
                    setBarColor(anim.ind, COLORS.FLASH)
        
                    setTimeout(() => { setBarColor(anim.ind, COLORS.DEFAULT) }, ANIM_DELAY);
                }
                else {
                    setBarColor(anim.ind, anim.col);
                }
        
                break;
    
            case ANIMATION_TYPE.finished:
                // run through all the bars, top to bottom
                playSuccess();
        
                break;
    
            default:
                console.log(`animation ${anim.animType} does not exist`)
                break;
        }
    
        // wait for some time
        await waitMs(GLOBALS.DELAY_MS);
      
    }

}

// success animation
function successFlashes() {
    //change color of each bar one by one by increasing delay for each one
    for(let i = 0; i < BARS.length; i++){
      setTimeout(() => {
        setBarColor(i, COLORS.DONE);
      }, i * GLOBALS.DELAY_MS);
    }
  
    //reset all colors
    return new Promise(resolve => {  
      setTimeout(() => {
        resolve();
      }, BARS.length * GLOBALS. DELAY_MS);
    });
  }
  
  async function playSuccess() {
  
    //wait for all the bars to light up
    await successFlashes();
    for(let i = 0; i < BARS.length; i++){
      setBarColor(i, COLORS.DEFAULT);
    }
  
    // give control back to user
    GLOBALS.ANIM_STARTED = false;
    GLOBALS.IS_SORTING = false;
    GLOBALS.IS_DATA_RANDOMIZED = false;
  }

// set bar color of index
function setBarColor(ind, col) {
    if(typeof col === "number") col = ID_TO_COLOR[col]; 
    if(BARS[ind] === undefined) return;
    BARS[ind].style.backgroundColor = col;
}

// set bar height of index
function setBarHeight(ind, h) { 
    if(BARS[ind] === undefined) return;
    BARS[ind].style.height = h + "px";
}

// remove px, just get the number
function getBarHeight(ind) {
    return parseInt(BARS[ind].style.height.slice(0, -2));
}

// delay function for ms
function waitMs(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }