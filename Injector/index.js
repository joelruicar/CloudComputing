const express = require('express')
const exec = require('child_process').execSync;
const app = express()
const port = 3000

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/git-clone', (req, res) => {
    let jobj = {}
    jobj["url"] = req.body.giturl

    try {
        code = exec('bash injector.sh ' + req.body.jobid + ' ' + req.body.giturl)
        if(code == 0){
            exec('rm -rf tmp/' + req.body.jobid);
            jobj["response"] = "git repository cloned successfully"
        }
        else
            jobj["response"] = "an error occurred"
    } catch (err) {
        const { status, stderr } = err;
        if (status > 0) {
            jobj["response"] = "Repository not found"
        }
    }

    res.json(jobj)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})