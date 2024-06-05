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
    const WorkSheetCollection = client.db('EmployeeManagement').collection('Work');

app.get('/services', async(req, res)=>{
    const result = await ServiceCollection.find().toArray();
    res.send(result)
})

app.get('/employee', async(req, res)=>{
   const result = await UserCollection.find().toArray();
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

// PATCH endpoint to toggle the verified status of an employee
// PATCH endpoint to update an employee's information
app.patch('/employee/:id', async (req, res) => {
  const id = req.params.id; // Parse the id parameter from the request URL

  try {
    // Validate if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ObjectId provided' });
    }

    const { isVerified } = req.body; // Extract the isVerified field from the request body

    // Update the employee's isVerified status in the database
    const result = await UserCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isVerified } }
    );

    if (result.modifiedCount === 1) {
      // If the document was updated successfully
      res.status(200).json({ message: 'Employee information updated successfully' });
    } else {
      // If no document was modified (employee not found)
      res.status(404).json({ message: 'Employee not found or no changes were made' });
    }
  } catch (error) {
    // If an error occurred during the update operation
    console.error('Error updating employee information:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.get('/employee/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await UserCollection.findOne(query);
  res.send(result)
})



//  post
app.post('/users', async(req, res)=>{
   const user = req.body;
   const result = await UserCollection.insertOne(user);
   res.send(result)
})
app.post('/social', async(req, res)=>{
   const user = req.body;
   const result = await UserCollection.insertOne(user);
   res.send(result)
})

app.post('/worksheet', async(req,res)=>{
   const work = req.body;
   const result = await WorkSheetCollection.insertOne(work);
   console.log(result)
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