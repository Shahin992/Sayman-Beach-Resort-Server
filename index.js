const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.UsersName}:${process.env.PassWord}@cluster0.c60ctk1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const myRoomCollection = client.db('RoomCollectiondb').collection('rooms')
const bookingCollection = client.db('RoomCollectiondb').collection('bookings');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get('/rooms',async (req, res) => {
        const result = await myRoomCollection.find().toArray();
        res.send(result)
    })

    app.get('/rooms/:id', async (req,res) => {
        const id = req.params.id;
        const result = await myRoomCollection.findOne({_id: new ObjectId(id)});
        res.send(result);
      })

     

      app.post('/bookings', async (req, res) => {
        const newbooking = req.body;
        const result = await bookingCollection.insertOne(newbooking);
        res.send(result)
        console.log(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Sayeman Beach Resort Server')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})