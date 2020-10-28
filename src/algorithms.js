export const Algorithms = {

  //represents the heights of all bars
  data: [],
  totalPiecesOfData: 12,
  dataRange: { min: 1, max: 12 },

  fillWithRandomData: () => {
    Algorithms.data.splice(0, Algorithms.data.length);
    for(let i = 0; i < Algorithms.totalPiecesOfData; i++){
      Algorithms.data.push(randNum(Algorithms.dataRange.min, Algorithms.dataRange.max));
    }
  },

  //all of the sort algorithms sort the data first, then outputs a list of animations that determines colors / swaps, etc
  animations: [],
  ANIMATION_TYPE: {
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
  },


/* 
https://www.geeksforgeeks.org/bubble-sort/
TLDR: keeps swapping adjacent elements until the set is sorted.
*/

  bubbleSort: function() {
    this.animations = [];
    let animations = this.animations;
    let data = this.data;

    while(true) {
      // done is false if the list is not sorted yet
      let done = true;

      // for each pair of elements in the set
      for(let i = 0; i < data.length - 1; i++) {
        // make the selected ones red to highlight them
        animations.push({
          animType: this.ANIMATION_TYPE.flashColor,
          inds: [i, i + 1],
          col: 0
        });

        // if an element is greater than the one after, swap them
        if(data[i] > data[i + 1]){
          let t = data[i];
          data[i] = data[i + 1];
          data[i + 1] = t;
          done = false;

          // color them
          animations.push({
            animType: this.ANIMATION_TYPE.swap,
            inds: [i, i + 1]
          });
        }
      }
      
      // if done, then break while loop
      if(done) break;
    }

    animations.push({
      animType: this.ANIMATION_TYPE.finished
    });
  },


/*
~https://www.geeksforgeeks.org/merge-sort/~

https://en.wikipedia.org/wiki/Merge_sort < we are using this, which uses auxilliary array
TLDR: keep dividing the array in half, then merge them in order
*/

  // just call this function so we dont have to worry about parameters
  mergeSort: function() {
    this.animations = [];
    const aux = this.data.slice();
    this.mergeSortArr(this.data, aux, 0, this.data.length - 1);

    this.animations.push({
      animType: this.ANIMATION_TYPE.finished
    });
  },

  // calls merge sort recursively
  // when the array is divided into subarrays of size 1
  // start merging
  mergeSortArr: function(arr, aux, l, r) {
    // if the left pointer = right pointer, that means we've split into a subarray of length 1
    // this means stop recursively calling mergesort
    if(l === r) return;

    // get the middle index
    // ~~ (bitwise NOT NOT) floors the number (same as Math.floor() in this case) https://stackoverflow.com/questions/4055633/what-does-double-tilde-do-in-javascript
    // l + (r - l) / 2 is the same as (l + r) / 2, but avoid overflow
    const m = ~~(l + (r - l) / 2);

    // recursive calls
    // avoid copying back the values from aux to arr by simply switching them.
    this.mergeSortArr(aux, arr, l, m);
    this.mergeSortArr(aux, arr, m + 1, r);

    // merge the subarrays
    this.merge(aux, arr, l, m, r);
  },


 // merge subarrays in correct order
 // merge arr[l..m] and arr[m+1..r]
  merge: function(arr, aux, l, m, r) {

    // we need to copy the two subarrays into temporary arrays
    // let aL = [];
    // let aR = [];
    // for(let i = 0; i < len1; i++)
    //   aL[i] = arr[l + i];
    // for(let i = 0; i < len2; i++)
    //   aR[i] = arr[m + 1 + i];

    let i = l;
    let j = m + 1;
    let k = l;

    // compare and add the elements to the aux array in order
    while(i <= m && j <= r) {
      
      this.animations.push({
        animType: this.ANIMATION_TYPE.flashColor,
        inds: [i, j],
        col: 0
      });
      
      // if arr[i] should come before arr[j]
      if(arr[i] <= arr[j]) {
        this.animations.push({
          animType: this.ANIMATION_TYPE.set,
          ind: k,
          val: arr[i]
        });
        // this is the same as:
        // arr[k] = arr[i]
        // k++, i++ (remember that i++ assigns then increments)
        aux[k++] = arr[i++];
      }
      else {
        this.animations.push({
          animType: this.ANIMATION_TYPE.set,
          ind: k,
          val: arr[j]
        });

        aux[k++] = arr[j++];
      }

    }

    // if there are any elements left in either subarray, then add them to aux as well
    while(i <= m) {
      this.animations.push({
        animType: this.ANIMATION_TYPE.flashColor,
        inds: [i],
        col: 0
      });
      
      aux[k++] = arr[i++];
    }
    while(j <= r) {
      this.animations.push({
        animType: this.ANIMATION_TYPE.flashColor,
        inds: [j],
        col: 0
      });

      aux[k++] = arr[j++];
    }
    
  },


  /*
  https://www.geeksforgeeks.org/quick-sort/
  TLDR: recursively pick and element as a pivot and place elements less than the pivot below and elements larger above
  */
  quickSort: function() {
    this.animations = [];
    this.quickSortArr(this.data, 0, this.data.length - 1);
    this.animations.push({
      animType: this.ANIMATION_TYPE.finished
    });
  },

  // recursively called
  quickSortArr: function(arr, l, r) {
    if(l < r) {
      let pi = this.quickSortPartition(arr, l, r);

      this.quickSortArr(arr, l, pi - 1);
      this.quickSortArr(arr, pi + 1, r);
    }
  },

  // pick the last element as a pivot
  // elements smaller come before pivot
  // elements larger come after
  quickSortPartition: function(arr, l, r) {
    // pivot = last element
    let pivot = arr[r];

    // highlight the pivot
    this.animations.push({
      animType: this.ANIMATION_TYPE.set,
      ind: r,
      col: 4
    });

    // i = index of the element smaller than current one (j)
    let i = l - 1;
    for(let j = l; j < r; j++) {
      // highlight bar i and j
      this.animations.push({
        animType: this.ANIMATION_TYPE.flashColor,
        inds: [i, j],
        col: 0
      });

      // if the current element is less than the pivot
      if(arr[j] < pivot) {
        // increment index of smaller element
        i++;

        // swap i and j
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        this.animations.push({
          animType: this.ANIMATION_TYPE.swap,
          inds: [i, j]
        });
      }
    }

    // new pivot is the last i + 1
    i++;
    let temp = arr[i];
    arr[i] = arr[r];
    arr[r] = temp;

    this.animations.push({
      animType: this.ANIMATION_TYPE.swap,
      inds: [i, r]
    });

    // unhighlight old pivot
    this.animations.push({
      animType: this.ANIMATION_TYPE.set,
      ind: r,
      col: 1
    });
    
    return i;
  },

  init: () => {
    Algorithms.fillWithRandomData();
  },
}

// get random integer from min(inclusive) to max(exclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// random number
function randNum(min, max) {
  return Math.random() * (max - min) + min;
}
