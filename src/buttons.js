import { doAnimationsAsync, GLOBALS, ANIMATIONS, remakeBars } from './rendering/animations'
import { Algorithms } from './algorithms';

// input (numbers)
const posIntOverZero = /^[1-9]\d*$/;

export const Buttons = {

    // previous values to restore to if input invalid
    lastBarCount: 12,
    lastDelay: 16,

    barCountInput: null,
    delayInput: null,

    // element that holds buttons
    buttonContainer: null,

    // start a sort of name
    startSortOfType: function(sort) {
        if(GLOBALS.IS_SORTING || GLOBALS.ANIM_STARTED) return;
        GLOBALS.IS_SORTING = true;

        if(!GLOBALS.IS_DATA_RANDOMIZED) {
            Algorithms.fillWithRandomData();
            remakeBars();
        }

        // the name of the sort (ex: merge -> mergeSort)
        // const algo = Algorithms[sort + "Sort"];
        Algorithms[sort + "Sort"]();

        // animate
        GLOBALS.ANIM_STARTED = true;
        doAnimationsAsync(ANIMATIONS);
    },
    
    createAll: function() {
        // buttons
        this.buttonContainer = document.getElementsByClassName("buttons-container")[0];

        // create a button with text 'Xyz Sort' and on clicked, calls Algorithms.xyzSort();
        const createButton = (type) => {
            const b = document.createElement('button');
            // text for button
            const sortDisplayName = type.charAt(0).toUpperCase() + type.substring(1) + " Sort";

            b.setAttribute('id', type);
            b.innerHTML = sortDisplayName;
            b.onclick = () => this.startSortOfType(type);
            this.buttonContainer.appendChild(b);
        };

        createButton('bubble');
        createButton('merge');
        createButton('quick');

        this.barCountInput = document.getElementById('bar-count');
        this.delayInput = document.getElementById('delay');

        const barCountHandler = (e) => {
            const newValue = e.target.value;

            // empty input
            if(newValue.length === 0) {
                this.lastBarCount = undefined;
                return;
            }

            // check to see if value (int > 0)
            if(posIntOverZero.test(newValue)) {
                // convert to int, clamp, and set
                const newInt = Math.min(parseInt(newValue), 1000);
                this.lastBarCount = newInt;
                this.barCountInput.value = newInt;

                return;
            }

            // else revert the value to the last valid one
            this.barCountInput.value = this.lastBarCount || "";
        }

        const barCountSubmitHandler = (e) => {
            if(!!e.key && e.key !== 'Enter') return;
            if(e.target.value.length === 0) return;

            const newValue = parseInt(e.target.value);
            if(newValue === Algorithms.totalPiecesOfData) return;

            GLOBALS.HALT_ANIMATE = true;

            Algorithms.totalPiecesOfData = newValue;
            Algorithms.fillWithRandomData();
            remakeBars();

            GLOBALS.HALT_ANIMATE = false;
        }

        this.barCountInput.addEventListener('input', barCountHandler);
        this.barCountInput.addEventListener('propertychange', barCountHandler);
        this.barCountInput.addEventListener('keyup', barCountSubmitHandler);
        this.barCountInput.addEventListener('blur', barCountSubmitHandler);


        const delayHandler = (e) => {
            const newValue = e.target.value;

            // empty input
            if(newValue.length === 0) {
                this.lastDelay = undefined;
                return;
            }

            // check to see if valie (int > 0)
            if(posIntOverZero.test(newValue)) {
                // convert to int, clamp, and set
                const newInt = Math.min(parseInt(newValue), 100);
                this.lastDelay = newInt;
                this.delayInput.value = newInt;

                return;
            }

            // revert the value to the last valid one
            this.delayInput.value = this.lastDelay || "";
        }

        const delaySubmitHandler = (e) => {
            if(e.key !== 'Enter') return;

            const newValue = parseInt(e.target.value); 
            GLOBALS.DELAY_MS = newValue;
        }

        this.delayInput.addEventListener('input', delayHandler);
        this.delayInput.addEventListener('propertychange', delayHandler);
        this.delayInput.addEventListener('keyup', delaySubmitHandler);
        this.delayInput.addEventListener('blur', delaySubmitHandler);

        // randomize data button
        document.getElementById('randomize-button').onclick = () => {
            Algorithms.fillWithRandomData();
            remakeBars();
            GLOBALS.IS_DATA_RANDOMIZED = true;
        };
    }
}