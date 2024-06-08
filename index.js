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
    const PaymentCollection = client.db('EmployeeManagement').collection('Payment');

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

//  payment
app.get('/payments', async(req, res)=>{
  const result = await PaymentCollection.find().toArray();
  res.send(result)
})

 app.get('/user', async(req, res)=>{
   const result= await UserCollection.find().toArray();
   res.send(result)
 })

// API endpoint to fetch worksheets by email
app.get('/worksheets/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email)
    const query = {email: email}
    const worksheets = await WorkSheetCollection.find(query).toArray();
    res.json(worksheets);
  } catch (error) {
    console.error('Error fetching worksheets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

 

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


// pathch
// Example Express.js endpoint
app.patch('/update-employee/:id', async (req, res) => {
  const employeeId = req.params.id;
  const { role } = req.body; // This will be { role: 'HR' }

  try {
      // Convert employeeId to ObjectId if necessary
      const objectId = new ObjectId(employeeId);

      const result = await UserCollection.updateOne(
          { _id: objectId },
          { $set: { role } }
      );

      console.log('Update result:', result);

      if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Employee not found or role already updated' });
      }

      res.json({ success: true });
  } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Failed to update employee' });
  }
});

// pathc fire

app.patch('/fire-employee/:id', async (req, res) => {
  const employeeId = req.params.id;

  try {
      // Convert employeeId to ObjectId if necessary
      const objectId = new ObjectId(employeeId);

      const result = await UserCollection.updateOne(
          { _id: objectId },
          { $set: { fired: true } }
      );

      console.log('Fire result:', result);

      if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Employee not found or already fired' });
      }

      res.json({ success: true });
  } catch (error) {
      console.error('Error firing employee:', error);
      res.status(500).json({ error: 'Failed to fire employee' });
  }
})

app.get('/employee/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await UserCollection.findOne(query);
  res.send(result)
})

// employee details
app.get('/api/employees/:slug', async (req, res) => {
  try {
    const employee = await UserCollection.findOne({ email: req.params.slug });
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// chart
app.get('/employee/:id', async (req, res) => {
  const employeeId = req.params.id;
  try {
  
     
      const employee = await UserCollection.findOne({ _id: new ObjectId(employeeId) });

      if (!employee) {
          return res.status(404).send('Employee not found');
      }

      res.json(employee);
  } finally {
      await client.close();
  }
});

app.get('/payments/:bank', async(req, res)=>{
  const id = req.params.bank;
  const query = {bank_account : id}
  const result = await PaymentCollection.find(query).toArray();
  res.send(result) 
})

app.get('/work-records', async(req, res)=>{
  const result = await WorkSheetCollection.find().toArray();
  res.send(result)
})

app.get('/payment/:email', async(req, res)=>{
  const email = req.params.email;
  const query = {email: email};
  const result = await PaymentCollection.find(query).toArray()
  res.send(result)
})



// Get all verified employees


app.get('/employees/verified', async (req, res) => {
  try {
      const employees = await UserCollection.find({ fired: false });
      res.json(employees);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Promote an employee to HR
app.post('/employees/makeHR/:id', async (req, res) => {
  try {
      await UserCollection.findByIdAndUpdate(req.params.id, { isHR: true });
      res.status(200).json({ message: 'Employee promoted to HR' });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fire an employee
app.post('/employees/fire/:id', async (req, res) => {
  try {
      await UserCollection.findByIdAndUpdate(req.params.id, { fired: true });
      res.status(200).json({ message: 'Employee fired' });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Adjust employee salary
app.post('/employees/salary/:id', async (req, res) => {
  try {
      await UserCollection.findByIdAndUpdate(req.params.id, { salary: req.body.salary });
      res.status(200).json({ message: 'Salary updated' });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Admin
app.get('/varify-employee', async(req, res)=>{
  const result = await UserCollection.find({isVerified: true}).toArray();
  res.send(result)
})
// app.get('/hr', async(req, res)=>{
//   const result = await UserCollection.find({role: 'HR'}).toArray();
//   res.send(result)
// })



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

// payment post
app.post('/Postpayments', async(req, res)=>{
  const query =req.body;
  const result  = await PaymentCollection.insertOne(query);
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