const express = require('express');
const { connect } = require('mongoose');
const KeyModel = require('./models/Key');
const FireModel = require('./models/Fire');
const dotenv = require('dotenv')
dotenv.config();

const app = express();

app.use(express.json());

app.get('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) {
        res.status(401).send()
        return
    }
    if(!await KeyModel.findOne({ key:auth })) {
        res.status(401).send()
        return
    }
    res.status(200).send();
})

app.post('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) return res.status(401).send();
    let dbEntry = await KeyModel.findOne({ key:auth });
    if(!dbEntry) return res.status(401).send();
    if(dbEntry.authLevel < 1) return res.status(401).send()
    
    let json = req.body;
    let severity = json.severity;
    let locCode = json.locCode;
    let description = json.description;

    if(!severity || !locCode || !description) {
        res.status(400).send();
        return;
    } else if(typeof locCode !== 'number' || typeof severity !== 'number' || typeof description !== 'string') {
        res.status(400).send();
        return;
    }

    let FireModelForLoc = await FireModel.findOne({ locCode: locCode });
    if(!FireModelForLoc) {
        let newModel = new FireModel({ 
            locCode: locCode,
            fires: [{ 
                description: description,
                severity: severity,
                active: true,
                timestamp: Date.now(),
                humanFriendlyTimestamp: Date.toString(),
                instantiatedBy: auth 
            }]
        });
        await newModel.save().catch(() => {
            res.status(500).send();
            return;
        })
    } else {
        FireModelForLoc.fires.push({
            description: description, 
            severity: severity, 
            active: true, 
            timestamp: Date.now(), 
            humanFriendlyTimestamp: 
            Date.now().toString(), 
            instantiatedBy: auth
        })
        await FireModelForLoc.save().catch(() => {
            res.status(500).send();
            return;
        })
    }

    res.status(201).send();
    return;
})

app.listen(process.env.PORT);

(async () => {
    await connect('mongodb://localhost:27017/fireappbackend', {
        useUnifiedTopology: true,
        useFindAndModify: false,
        useNewUrlParser: true
    })
    console.log('DB Logged in.')
})()