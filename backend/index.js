require('dotenv').config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
// const bodyParser = require("body-parser")
const app = express()
const Routes = require("./routes/route.js")
const v2Routes = require("./routes/v2.js")


const PORT = process.env.PORT || 5000

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(express.json({ limit: '10mb' }))
app.use(cors())

mongoose
    .connect(process.env.mongo)
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

const errorHandler = require('./middlewares/errorHandler');

app.use('/', Routes);
app.use('/api/v2', v2Routes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})