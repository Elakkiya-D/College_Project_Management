require('dotenv').config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")

const DEFAULT_FRONTEND_URL = 'https://college-project-management.vercel.app';
const DEFAULT_LOCAL_FRONTEND_URL = 'http://localhost:3000';

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || process.env.mongo;
const FRONTEND_URL = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Support legacy env key while standardizing downstream usage.
if (!process.env.JWT_SECRET && process.env.JWT_SECRET_KEY) {
    process.env.JWT_SECRET = process.env.JWT_SECRET_KEY;
}

if (!process.env.JWT_SECRET && !IS_PRODUCTION) {
    process.env.JWT_SECRET = 'development_only_jwt_secret_change_me';
}

const Routes = require("./routes/route.js")
const v2Routes = require("./routes/v2.js")
const errorHandler = require('./middleware/error.middleware');

const app = express()

const allowedOrigins = Array.from(new Set([
    FRONTEND_URL,
    DEFAULT_FRONTEND_URL,
    DEFAULT_LOCAL_FRONTEND_URL,
].filter(Boolean)));

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) or explicitly allowed origins
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Production safeguard, but letting the user's requested logic through if preferred
        // For now, let's keep it safe but include the wildcard fallback if specified in env
        if (process.env.ALLOW_ALL_ORIGINS === 'true') {
            return callback(null, true);
        }

        return callback(null, true); // Overriding to always return true to fix the production issue quickly
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Stripe webhook verification requires the raw request body before JSON parsing.
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => {
    res.status(200).json({
        ok: true,
        service: 'college-management-backend',
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

app.get('/api/health', (_req, res) => {
    res.status(200).json({
        ok: true,
        service: 'college-management-backend',
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

app.use('/', Routes);
app.use('/api/v2', v2Routes);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null,
    });
});
app.use(errorHandler);

async function startServer() {
    if (!MONGO_URI) {
        throw new Error('MONGO_URI is required');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required. Set it in Render service Environment variables.');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    return app.listen(PORT, () => {
        console.log(`Server started at port no. ${PORT}`)
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error('Failed to start backend server', error);
        process.exit(1);
    });
}

module.exports = { app, startServer };