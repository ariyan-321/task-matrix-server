const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ariyan.mefyr.mongodb.net/?retryWrites=true&w=majority&appName=Ariyan`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("Task-Matrix");
    const taskCollection = db.collection("tasks");
    const usersCollection = db.collection("users");

    app.post("/users", async (req, res) => {
      const { userInfo } = req.body;
      console.log(userInfo)
      const query = { email: userInfo?.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "User Already Exists In DB",
          insertedId: null,
        });
      }
      const result=await usersCollection.insertOne(userInfo);
      res.send(result)
    });


    app.get("/task-user/:email",async(req,res)=>{
        const email=req.params.email;
        const query={email};
        const result=await taskCollection.find(query).toArray();
        res.send(result);
    })


    app.post("/tasks", async (req, res) => {
      const data = req.body;
      const result = await taskCollection.insertOne(data);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const { updatedTask } = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: updatedTask,
      };
      const result = await taskCollection.updateOne(query, updatedDoc);
      res.send(result);



      app.patch("/tasks/:id", async (req, res) => {
        try {
          const taskId = req.params.id;
          const { category } = req.body;
      
          if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid Task ID" });
          }
      
          const result = await taskCollection.updateOne(
            { _id: new ObjectId(taskId) },
            { $set: { category } }
          );
      
          if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Task not found" });
          }
      
          res.json({ message: "Task updated successfully", result });
        } catch (error) {
          console.error("Error updating task:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      });

    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running properly");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
