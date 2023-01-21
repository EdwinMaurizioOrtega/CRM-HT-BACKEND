import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import crmRoutes from './app/routes/crm.routes.js';

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


//API Endpoint
app.use('/api/crm-ht', crmRoutes);

app.get('/', (req, res) => {
  res.send('APP IS RUNNING HIPERTRONICS.');
})


//const CONNECTION_URL = 'mongodb://localhost:27017/memories';
const CONNECTION_URL = 'mongodb+srv://hipertronics:81A00ydsLOOGibyK@cluster0.a70yomk.mongodb.net/crmht?retryWrites=true&w=majority';
const PORT = process.env.PORT|| 80;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
    .catch((error) => console.log(`${error} did not connect`));

mongoose.set('useFindAndModify', false);
