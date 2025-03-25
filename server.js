const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path:'./config/config.env'});

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));

// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));


// Cookie parser
app.use(cookieParser());

// Route files
const companies = require('./routes/companies');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');

// Mount routers
app.use('/api/v1/companies', companies);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

// Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.promise}`);
    // Close server & exit process
    server.close(() => process.exit(1));
})