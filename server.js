require("dotenv").config();
const express = require('express')
const cmsRoutes = require("./src/cms/routes")
const cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express()
const port = process.env.APP_PORT || 3000

app.use(cors({
    origin: ["http://localhost:4200", "http://localhost:8080"],
    methods: ["GET, HEAD, PUT, PATCH, POST, DELETE"],
    credentials: true
}));
app.use(express.json());
app.use('/api/v1/cms', cmsRoutes)
app.use(cookieParser());


app.get('/', (req, res)=> {
    res.send("Hello world");
})



app.listen(port, () => console.log(`App listening on port ${port}`));