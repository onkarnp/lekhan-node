const express = require('express')
const cmsRoutes = require("./src/cms/routes")
const cors = require('cors')
const app = express()
const port = process.env.port | 3000

app.use(express.json());
app.use(cors());
app.use('/api/v1/cms', cmsRoutes)

app.get('/', (req, res)=> {
    res.send("Hello world");
})



app.listen(port, () => console.log(`App listening on port ${port}`));