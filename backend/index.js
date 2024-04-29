const express = require('express')
const app = express()
const port = 5000
const mongoDB=require("./db")
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
mongoDB();

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","https://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With , Content-Type, Accept"
  );
  next();
});
app.use(cors(corsOptions));
app.use(express.json())
app.use('/api',require("./Routes/CreateUser"));
app.use("/api",require("./Routes/DisplayData"));
app.use("/api",require("./Routes/OrderData"));
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})