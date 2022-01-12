const express = require('express');
const app = express();


// app.use('/', (req, res, next)=> {
//     console.log("First middeware!")
//     next();
// });

// app.use("/users",(req, res, next)=> {
//     console.log("Second middleware!");
//     res.send("<h1>Hello users!</h1>");
// });

app.use("/users",(req, res, next)=> {
    console.log("First middleware!");
    res.send("<h1>Hello users!</h1>");
});

app.use((req, res, next) => {
    console.log("Second middleware!");
    res.send("<h1>Hello!</h1>");
});
 
app.listen(4500);