const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
// const jwt = require("jsonwebtoken");
require("dotenv").config();
// const stripe = require("stripe")(process.env.STRIPE_SEC)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pz6rkt0.mongodb.net/?retryWrites=true&w=majority`;

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
          // Connect the client to the server	(optional starting in v4.7)
          await client.connect();

          const userCollection = client.db("JobTaskDB").collection("users");
          const taskCollection = client.db("JobTaskDB").collection("allTasks");
          // users api
          app.get("/users", async (req, res) => {
               const result = await userCollection.find().toArray();
               res.send(result);
          });
          app.get("/users/:id", async (req, res) => {
               const id = req.params.id;
               const query = { _id: new ObjectId(id) };
               result = await userCollection.findOne(query);
               res.send(result);
          });
          app.post("/users", async (req, res) => {
               const user = req.body;
               const query = { email: user.email };
               //  console.log("Query", query);
               const existingUser = await userCollection.findOne(query);
               if (existingUser) {
                    return res.send({ message: "user already exists" });
               }
               const result = await userCollection.insertOne(user);
               res.send(result);
          });

          // task manage api
          app.get("/allTasks", async (req, res) => {
               const result = await taskCollection.find().toArray();
               res.send(result);
          });
          app.get("/allTasks/:id", async (req, res) => {
               const id = req.params.id;
               const query = { _id: new ObjectId(id) };
               result = await taskCollection.findOne(query);
               res.send(result);
          });
          app.post("/allTasks", async (req, res) => {
               const user = req.body;
               const result = await taskCollection.insertOne(user);
               res.send(result);
          });

          app.put("/allTasks/:id", async (req, res) => {
               const id = req.params.id;
               console.log("delete", id);
               const filter = { _id: new ObjectId(id) };
               const updatedStatus = req.body;
               console.log(updatedStatus.status);
               if (updatedStatus.status === "todo") {
                    const updatedAssignment = {
                         $set: {
                              status: "ongoing",
                         },
                    };
                    const result = await taskCollection.updateOne(
                         filter,
                         updatedAssignment
                    );
                    res.send(result);
               }
               if (updatedStatus.status === "ongoing") {
                    const updatedAssignment = {
                         $set: {
                              status: "completed",
                         },
                    };
                    const result = await taskCollection.updateOne(
                         filter,
                         updatedAssignment
                    );
                    res.send(result);
               }
          });
          app.patch("/allTasks/:id", async (req, res) => {
               const id = req.params.id;
               const filter = { _id: new ObjectId(id) };
               const updated = req.body;
               const updatedTask = {
                    $set: {
                         taskTitle: updated.taskTitle,
                         description: updated.description,
                         deadLine: updated.deadLine,
                         Priority: updated.Priority,
                    },
               };
               const result = await taskCollection.updateOne(
                    filter,
                    updatedTask
               );
               res.send(result);
          });

          app.delete("/allTasks/:id", async (req, res) => {
               const id = req.params.id;
               const query = { _id: new ObjectId(id) };
               const result = await taskCollection.deleteOne(query);
               res.send(result);
          });

          // Send a ping to confirm a successful connection
          await client.db("admin").command({ ping: 1 });
          console.log(
               "Pinged your deployment. You successfully connected to MongoDB!"
          );
     } finally {
          // Ensures that the client will close when you finish/error
          //     await client.close();
     }
}
run().catch(console.dir);

app.get("/", (req, res) => {
     res.send("ContestHub server is running");
});

app.listen(port, () => {
     console.log(`ContestHub server listening on port ${port}`);
     // console.log(`ContestHub server listening on port ${port}`);
});
