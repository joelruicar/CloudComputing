const express = require('express')
const app = express()
const port = 3000

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.get('/', (req, res) => {
    let jobj = {}
    // jobj["response"] = "success"
    // console.log(JSON.stringify(jobj))
    // console.log(JSON.stringify(req.headers));
    // console.log(JSON.stringify(req.body));
    // res.json(jobj)
    jobj["headers"] = req.headers
    jobj["body"] = req.body
    res.json(jobj)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})