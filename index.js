const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

const corsConfig = {
    origin : "*",
    Credential: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
};
app.options("", cors(corsConfig))

//middle-ware
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5metfvs.mongodb.net/?retryWrites=true&w=majority`;

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
        const userCollection = client.db("learn-logix").collection("users");
        const teacherCollection = client.db("learn-logix").collection("teachers");
        const classCollection = client.db("learn-logix").collection("classes");
        const enrollCollection = client.db("learn-logix").collection("enrolls");
        const reviewCollection = client.db("learn-logix").collection("reviews");
        const createAssignCollection = client.db("learn-logix").collection("createAssigns");
        const submitAssignCollection = client.db("learn-logix").collection("submitAssigns");

        //user related api
        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users/:email', async (req, res) => {
            const item = req.body;
            const mail = req.params.email;
            const filter = { email: mail }
            const updatedDoc = {
                $set: {
                    role: item.role,
                }
            }

            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.get('/users/:email', async (req, res) => {
            const mail = req.params.email;
            const query = { email: mail }
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })

        app.get('/users/teacher/:email', async (req, res) => {
            const email = req.params.email;

            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let teacher = false;
            if (user) {
                teacher = user?.role === 'teacher';
            }
            res.send({ teacher });
        })



        //teacher related api
        app.patch('/teachers/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: item.status,
                }
            }

            const result = await teacherCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.post('/teachers', async (req, res) => {
            const teacher = req.body;
            const result = await teacherCollection.insertOne(teacher);
            res.send(result);
        })

        app.get('/teachers/:mail', async (req, res) => {
            const mail = req.params.mail;
            const query = { email: mail }
            const result = await teacherCollection.findOne(query);
            res.send(result);
        })

        app.get('/teachers', async (req, res) => {
            const result = await teacherCollection.find().toArray();
            res.send(result);
        })



        //clasees related api
        app.post('/classes', async (req, res) => {
            const classs = req.body;
            const result = await classCollection.insertOne(classs);
            res.send(result);
        })

        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result);
        })

        app.get('/classes/approved', async (req, res) => {

            const query = { status: 'approved' }

            const result = await classCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/classes/single/:id', async (req, res) => {
            const id = String(req.params.id);
            const query = { _id: new ObjectId(id) }
            const result = await classCollection.findOne(query);
            res.send(result);
        })

        app.get('/classes/:email', async (req, res) => {

            const mail = req.params.email;
            const query = { email: mail };


            const cursor = classCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/popularclass', async (req, res) => {
            try {
                const data = await classCollection.find().toArray();

                // const intResult = data.map((item) => ({
                //     ...item,
                //     totalenroll: parseInt(item.totalenroll)
                // }));

                const result = data.sort((a, b) => b.totalenroll - a.totalenroll).slice(0, 3);

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });




        app.patch('/classes/update/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    name: item.name,
                    email: item.email,
                    price: item.price,
                    description: item.description,
                    title: item.title,
                    image: item.image
                }
            }

            const result = await classCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.patch('/classes/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: item.status,
                }
            }

            const result = await classCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.patch('/classes/enroll/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;

            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    totalenroll: item.totalenroll,
                }
            }
            const result = await classCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.delete('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await classCollection.deleteOne(query);
            res.send(result);
        })


        //enrollment api
        app.post('/enroll', async (req, res) => {
            const enroll = req.body;
            const result = await enrollCollection.insertOne(enroll);
            res.send(result);
        })

        app.get('/myenroll/:email', async (req, res) => {
            const mail = req.params.email;
            const query = { userEmail: mail };

            const result = await enrollCollection.find(query).toArray();
            res.send(result);
        })

        //review related api
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { classId: id };

            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/reviewhome', async (req, res) => {
            const temp = await reviewCollection.find().toArray();
            const result = temp.slice(0, 5);
            res.send(result);
        })

        //statistics api

        app.get('/stats', async (req, res) => {
            try {
                const totalUser = await userCollection.estimatedDocumentCount();
                const totalClass = await classCollection.estimatedDocumentCount();
                const totalEnroll = await enrollCollection.estimatedDocumentCount();
                res.status(200).json({ totalUser, totalClass, totalEnroll });
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.get('/totalass/:id', async (req, res) => {
            try {
                const classId = req.params.id;
                const query = { classId: classId };
                // const totalAss = await createAssignCollection.estimatedDocumentCount({classId});
                const totalAss = (await createAssignCollection.find(query).toArray()).length;

                res.status(200).json({ totalAss});
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });


        //create assignment api
        app.post('/createAss', async (req, res) => {
            const assignment = req.body;
            const result = await createAssignCollection.insertOne(assignment);
            res.send(result);
        })

        app.get('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { classId: id };

            const result = await createAssignCollection.find(query).toArray();
            res.send(result);
        })

        //submit assignment api
        app.post('/submitAss', async (req, res) => {
            const assignment = req.body;
            const currentDate = new Date();
            const result = await submitAssignCollection.insertOne({ currDate : currentDate, ...assignment});
            res.send(result);
        })

        app.get('/assperday', async (req, res) => {
            const today = new Date().toISOString().split('T')[0];
            // today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
            // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
            try {
                const todayData = await submitAssignCollection.find({
                    currDate: { $regex: today, $options: 'i' },
                }).toArray();

    
                res.json({
                    count: todayData.length
                });
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('boss in ordering')
})

app.listen(port, () => {
    console.log(`Learn Logix in running of port ${port}`);
})
