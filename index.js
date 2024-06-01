const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var cookieParser = require('cookie-parser')
const port = process.env.PORT || 4000;
const app = express();

app.get('/', (req, res)=>{
    res.send('server running')
})

// middle ware
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'], 
    credentials: true 
  }));
app.use(express.json());
app.use(cookieParser())

// mongodb start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p7hqbnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

//    database Collection
    const ServiceCollection = client.db('EmployeeManagement').collection('Services');
    const UserCollection = client.db('EmployeeManagement').collection('Users');

app.get('/services', async(req, res)=>{
    const result = await ServiceCollection.find().toArray();
    res.send(result)
})

app.get('/viewdetails/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)};
    
     const result = await ServiceCollection.findOne(query);
   
    console.log(result)
     res.send(result)
 })

 app.get('/users/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await UserCollection.findOne({ email });
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


//  post
app.post('/users', async(req, res)=>{
   const user = req.body;
   const result = await UserCollection.insertOne(user);
   res.send(result)
})

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, ()=>{
    console.log(`server running on ${port}`)
})

// EmployeeManagement
// aIR4fjdszVfc52h6