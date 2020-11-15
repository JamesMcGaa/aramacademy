store = {}
for(i=0; i<70000000; i++){
    store[2*i] = 730+i
}
console.log("done");
console.log(Object.keys(store).length);