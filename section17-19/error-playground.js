const sum = (a, b) => {
    if(a && b){
        return a + b;
    }
    throw new Error('Invalid arguments');
};

//try catch is good for sync code
try{
    console.log(sum(1));
}catch(err){
    console.log('Error occurred');
    // console.log(err);
}
console.log('This works!');

//.then().catch() for async code