const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');


dotenv.config();

const port=process.env.PORT || 5000;
const app=express();
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ariyan.mefyr.mongodb.net/?retryWrites=true&w=majority&appName=Ariyan`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {

    const db=client.db("Task-Matrix");
    const taskCollection=db.collection("tasks");

    app.post("/tasks",async(req,res)=>{
        const data=req.body;
        const result=await taskCollection.insertOne(data);
        res.send(result);
    })

    app.get("/tasks",async(req,res)=>{
        const result=await taskCollection.find().toArray();
        res.send(result);
    })


    app.delete("/tasks/:id",async(req,res)=>{
        const id=req.params.id;
        const query={_id: new Object(id)}
        const result=await taskCollection.deleteOne(query);
        res.send(result);
    })


    
  } finally {
   
  }
}
run().catch(console.dir);








app.get("/",(req,res)=>{
    res.send("server is running properly");
})


app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})
