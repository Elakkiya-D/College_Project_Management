require('dotenv').config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
// const bodyParser = require("body-parser")
const app = express()
const Routes = require("./routes/route.js")


const PORT = process.env.PORT || 5000

// CORS Configuration for production
// Can be set via ALLOWED_ORIGINS env var (comma-separated) or uses defaults
const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://college-project-management.vercel.app',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : defaultOrigins;

// Add dynamic Vercel preview URLs support
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list or is a Vercel preview URL
        if (allowedOrigins.includes(origin) || 
            origin.endsWith('.vercel.app') ||
            origin.includes('localhost')) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

// Stripe webhook must be placed before express.json() to get the raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }));


app.use(express.json({ limit: '10mb' }))
app.use(cors(corsOptions))

// Handle preflight requests
app.options('*', cors(corsOptions))

// Health check endpoint (useful for uptime monitoring and avoiding cold starts)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'College Management System API',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

mongoose
    .connect(process.env.mongo)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

const errorHandler = require('./middlewares/errorHandler');

app.use('/', Routes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})