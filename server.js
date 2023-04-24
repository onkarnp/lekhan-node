const cookieParser = require('cookie-parser');
require("dotenv").config();
const express = require('express')
const cors = require('cors')
const cmsRoutes = require("./src/cms/routes")
const app = express()
const port = process.env.APP_PORT || 3000

app.use(cors({
    origin: ["http://localhost:4200", "http://localhost:8080"],
    methods: ["GET, HEAD, PUT, PATCH, POST, DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/cms', cmsRoutes)

app.get('/', (req, res)=> {
    var cmscookie = req.cookies.cmscookie;
    res.send(cmscookie);
    
})



app.listen(port, () => console.log(`App listening on port ${port}`));