import { Algorithms } from './algorithms';

export const Test = {
    setup: function() {
        // test to see if algorithms are working
        document.getElementById('test-button').onclick = () => {
            const fails = [];
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
    }
}