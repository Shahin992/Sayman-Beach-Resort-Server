const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.UsersName}:${process.env.PassWord}@cluster0.c60ctk1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const myRoomCollection = client.db("RoomCollectiondb").collection("rooms");
const bookingCollection = client.db("RoomCollectiondb").collection("bookings");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get("/rooms", async (req, res) => {
      const result = await myRoomCollection.find().toArray();
      res.send(result);
    });

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const result = await myRoomCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    await bookingCollection.createIndex(
      { date: 1, title: 1 },
      { unique: true }
    );

    app.get("/bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;

      const result = await bookingCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    app.get("/bookings/:title", async (req, res) => {
      const title = req.params.title;
      const result = await bookingCollection.findOne({ title: title });
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const newbooking = req.body;
      try {
        const result = await bookingCollection.insertOne(newbooking);
        res.send(result);
        console.log(result);
      } catch (error) {
        if (error.code === 11000) {
          res
            .status(400)
            .send(
              "Duplicate booking. A booking with the same date and title already exists."
            );
        } else {
          res.status(500).send("Internal Server Error");
        }
      }
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedbooking = req.body;
      const Product = {
        $set: {
          date: updatedbooking.date,
        },
      };
      const result = await bookingCollection.updateOne(filter, Product, option);
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.TOKENJWT, { expiresIn: "1h" });
      res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
      })
          .send({ success: true });
      
    });


    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Sayeman Beach Resort Server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
