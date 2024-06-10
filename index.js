const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');

const port = process.env.PORT || 4000;
const app = express();

app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173','https://graceful-daifuku-1e1460.netlify.app'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p7hqbnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
};

// Middleware for Token Verification
const VerifyToken = async (req, res, next) => {
  const token = req.cookies?.Token;
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Forbidden" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
   

    const ServiceCollection = client.db('EmployeeManagement').collection('Services');
    const UserCollection = client.db('EmployeeManagement').collection('Users');
    const WorkSheetCollection = client.db('EmployeeManagement').collection('Work');
    const PaymentCollection = client.db('EmployeeManagement').collection('Payment');
    const messageCollection = client.db('EmployeeManagement').collection('message');

    // Routes
    app.get('/', (req, res) => {
      res.send('Server running');
    });

    app.get('/services', async (req, res) => {
      const result = await ServiceCollection.find().toArray();
      res.send(result);
    });

    app.get('/employee', VerifyToken, async (req, res) => {
      const result = await UserCollection.find().toArray();
      res.send(result);
    });

    app.get('/viewdetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ServiceCollection.findOne(query);
      res.send(result);
    });

    // Payments
    app.get('/payments', async (req, res) => {
      const result = await PaymentCollection.find().toArray();
      res.send(result);
    });

    app.get('/user', async (req, res) => {
      const result = await UserCollection.find().toArray();
      res.send(result);
    });

    app.get('/worksheets/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const worksheets = await WorkSheetCollection.find(query).toArray();
        res.json(worksheets);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/users/:email', async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email)
        const user = await UserCollection.findOne({ email });
        if (user) {
          res.send(user);
        } else {
          res.status(404).send({ message: 'User not found' });
        }
      } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    app.patch('/employee/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ObjectId provided' });
      }
      const { isVerified } = req.body;
      const result = await UserCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isVerified } }
      );
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'Employee information updated successfully' });
      } else {
        res.status(404).json({ message: 'Employee not found or no changes were made' });
      }
    });

    app.patch('/update-employee/:id', async (req, res) => {
      const employeeId = req.params.id;
      const { role } = req.body;
      try {
        const objectId = new ObjectId(employeeId);
        const result = await UserCollection.updateOne(
          { _id: objectId },
          { $set: { role } }
        );
        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Employee not found or role already updated' });
        }
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
      }
    });

    app.patch('/fire-employee/:id', async (req, res) => {
      const employeeId = req.params.id;
      try {
        const objectId = new ObjectId(employeeId);
        const result = await UserCollection.updateOne(
          { _id: objectId },
          { $set: { fired: true } }
        );
        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Employee not found or already fired' });
        }
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fire employee' });
      }
    });

    app.get('/employee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UserCollection.findOne(query);
      res.send(result);
    });

    app.get('/api/employees/:slug',  async (req, res) => {
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

    app.get('/payments/:bank', async (req, res) => {
      const id = req.params.bank;
      const query = { bank_account: id };
      const result = await PaymentCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/work-records',  async (req, res) => {
      const result = await WorkSheetCollection.find().toArray();
      res.send(result);
    });

    app.get('/payment/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await PaymentCollection.find(query).toArray();
      res.send(result);
    });

    // massege get
    app.get('/message', async(req, res)=>{
      const result =await messageCollection.find().toArray();
      res.send(result)
    })

    app.get('/employees/verified', async (req, res) => {
      try {
        const employees = await UserCollection.find({ fired: false }).toArray();
        res.json(employees);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Authentication
    const authenticateUser = async (req, res, next) => {
      try {
        const { username, password } = req.body;
        const user = await UserCollection.findOne({ username });
        if (!user || user.fired || password !== user.password) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.user = user;
        next();
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    };

    app.post('/jwt', async (req, res) => {
      try {
        const { email } = req.body;
    
        // Retrieve user information from the database based on the email
        const user = await UserCollection.findOne({ email });
       console.log('user', user)
       if(user.fired){
         return res.status(403).json({error: 'you are fired'})
       }
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Now you have access to the user object, including the 'fired' property
        console.log('User:', user);
    
        // Generate JWT token
        const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '365d' });
        
        // Set JWT token in cookie and send response
        res.cookie('Token', token, cookieOption).send({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    

    app.post('/logout', async (req, res) => {
      res.clearCookie('Token', { expires: new Date(0), ...cookieOption }).send({ success: true });
    });

    // messagte
    app.post('/message', async(req, res)=>{
      const msg = req.body;
      const result = await messageCollection.insertOne(msg);
      res.send(result)
    })

    app.post('/employees/makeHR/:id', async (req, res) => {
      try {
        await UserCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { isHR: true } }
        );
        res.status(200).json({ message: 'Employee promoted to HR' });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/employees/fire/:id', async (req, res) => {
      try {
        await UserCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { fired: true } }
        );
        res.status(200).json({ message: 'Employee fired' });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // -----------------
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
    
      try {
        const user = await UserCollection.findOne({ email: email });
        console.log(user)
    
        if (!user) {
          return res.status(403).json({ message: 'Invalid Email or Password' });
        }
    
        // else if (user.fired) {
        //   return res.status(403).json({ message: 'You are not allowed to log in' });
        // }
    
        else if (user.password !== password) {
          return res.status(403).json({ message: 'Invalid Email or Password' });
        }
    
        // Authentication successful
        res.status(200).json({ message: 'Login successful' });
      } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ message: 'Server Error' });
      }
    });
    
    // ---------

    app.post('/employees/salary/:id', async (req, res) => {
      try {
        await UserCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { salary: req.body.salary } }
        );
        res.status(200).json({ message: 'Salary updated' });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/varify-employee',  async (req, res) => {
      const result = await UserCollection.find({ isVerified: true }).toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await UserCollection.insertOne(user);
      res.send(result);
    });

    app.post('/social', async (req, res) => {
      const user = req.body;
      const result = await UserCollection.insertOne(user);
      res.send(result);
    });

    app.post('/worksheet', async (req, res) => {
      const work = req.body;
      const result = await WorkSheetCollection.insertOne(work);
      res.send(result);
    });

    app.post('/Postpayments', async (req, res) => {
      const query = req.body;
      const result = await PaymentCollection.insertOne(query);
      res.send(result);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
