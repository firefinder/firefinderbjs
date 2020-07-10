const express = require('express');
const { connect } = require('mongoose');
const KeyModel = require('./models/Key');
const FireModel = require('./models/Fire');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());

app.get('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) {
        console.log('no auth')
        res.status(401).send()
        return
    }
    if(!await KeyModel.findOne({ key:auth })) {
        console.log('incorrect auth')
        res.status(401).send()
        return
    }
    
    let code = req.query.locCode;
    if(!code) {
        res.status(400).json({
            "message": "Please provide a location code (locCode parameter)"
        }).send()
        return;
    }
    if(isNaN(code)) {
        res.status(400).json({
            "message": "Location codes must be presented in integer format."
        }).send()
        return;
    }
    let locationFind = await FireModel.findOne({ locCode: code });
    if(!locationFind) {
        res.status(200).json({
            "message": "You provided an invalid location code, generally meaning you made a mistake in the request or there are no active fires in the area."
        }).send()
        return;
    } else {
        let activeFires = locationFind.fires.filter(object => object.active === true);
        if(activeFires.length < 1) {
            res.status(200).json({
                "message": "There are no active fires for this area."
            }).send()
            return;
        } else {
            res.status(200).json(activeFires).send();
            return;
        }
    }
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
                id: 1,
                description: description,
                severity: severity,
                active: true,
                timestamp: Date.now(),
                humanFriendlyTimestamp: moment().format("HH:mma ddd D/M/YY"),
                instantiatedBy: auth 
            }]
        });
        await newModel.save().catch(() => {
            res.status(500).send();
            return;
        })
        return res.status(201).json({
            "message": `Fire created in location code ${locCode} with ID ${parseInt('1')}.`
        }).send()
    } else {
        let idNo;
        try {
            idNo = Number(FireModelForLoc.fires[FireModelForLoc.fires.length - 1].id + 1);
        } catch (error) {
            idNo = undefined
            return res.status(500).json({
                "stack":error
            })
        }
        FireModelForLoc.fires.push({
            id: idNo,
            description: description, 
            severity: severity, 
            active: true, 
            timestamp: Date.now(), 
            humanFriendlyTimestamp: moment().format("h:mma ddd D/M/YY"), 
            instantiatedBy: auth
        })
        await FireModelForLoc.save().catch(() => {
            res.status(500).send();
            return;
        })
        return res.status(201).json({
            "message": `Fire created in location code ${locCode} with ID ${idNo}.`
        }).send()
    }
})

app.delete('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) return res.status(401).send();
    let dbEntry = await KeyModel.findOne({ key:auth });
    if(!dbEntry) return res.status(401).send();
    if(dbEntry.authLevel < 1) return res.status(401).send()

    let locCode = req.query.locCode;
    if(!locCode) {
        return res.status(400).json({
            "message": "Provide a location code to delete."
        }).send()
    }
    let dbLoc = await FireModel.findOne({ locCode: locCode })
    if(!dbLoc) {
        return res.status(404).json({
            "message": "This location code does not exist in the database. \nThis generally means that either the code is invalid or no fires have ever occurred in the area."
        }).send();
    } else {
        await dbLoc.deleteOne().catch(err => {
            console.error(err)
            res.status(500).send();
        });
        return res.status(200).send();
    }
})

app.patch('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) return res.status(401).send();
    auth = await KeyModel.findOne({ key: auth });
    if(!auth) return res.status(401).send();
    if(auth.authLevel < 1) return res.status(401).send();
})

app.listen(process.env.PORT);

(async () => {
    await connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true,
        useFindAndModify: false,
        useNewUrlParser: true
    })
    console.log('DB Logged in.')
})()