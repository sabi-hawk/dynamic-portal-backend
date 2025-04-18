import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from "helmet";
import path from 'path';
import dotenv from "dotenv";
import apiRouter from './routes';

dotenv.config()

const app = express();
const port = process.env.PORT || 8001;


// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());


app.disable('x-powered-by');
app.use("/api", apiRouter);

// Define your custom middleware
app.use((req, res, next) => {
  console.log(`Received a ${req.method} request at ${req.url}`);
  next();
});

app.use("/images", express.static(path.join(__dirname, '../../uploads')))

if (!process.env.MONGO_DB_CONNECTION_STRING) {
  throw new Error('MONGO_DB_CONNECTION_STRING is not defined in environment variables');
}

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to Database');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Blast API' });
});

// Create HTTP server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});