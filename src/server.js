const express = require('express');
const { connect } = require('mongoose');
const KeyModel = require('../models/Key');
const FireModel = require('../models/Fire');
const WebSocketManager = require('./WebSocketManager');
let LogManager = require('../etc/Logger');
const LogManagerClient = new LogManager('minimal');
const chalk = require('chalk');
const http = require('http')
const sio = require('socket.io');
const moment = require('moment');
const dotenv = require('dotenv');
const { isObject } = require('util');
dotenv.config();
const port = 4001;
// const wss = new ws.Server({ port:port });

const app = express()
app.use(express.json());
app.use(express.static('public'));

app.get('/', async (req, res) => {
    try {
        res.sendFile(process.cwd() + '/html/index.html')
        console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/') + ' and returned successfully.'));
        return;
    } catch (error) {
        console.log(LogManagerClient.errorLog('Error occurred pushing webpage on GET request to ' + chalk.cyan('/')));
        return;
    }
})

app.get('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) {
        console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('401')));
        res.status(401).send()
        return
    }
    if(!await KeyModel.findOne({ key:auth })) {
        console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('401')));
        res.status(401).send()
        return
    }
    
    let code = req.query.locCode;
    if(!code) {
        console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('400')));
        res.status(400).json({
            "message": "Please provide a location code (locCode parameter)"
        }).send()
        return;
    }
    if(isNaN(code)) {
        console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('400')));
        res.status(400).json({
            "message": "Location codes must be presented in integer format."
        }).send()
        return;
    }
    let locationFind = await FireModel.findOne({ locCode: code });
    if(!locationFind) {
        console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('404')));
        res.status(404).json({
            "message": "You provided an invalid location code, generally meaning you made a mistake in the request or there are no active fires in the area."
        }).send()
        return;
    } else {
        let activeFires = locationFind.fires.filter(object => object.active === true);
        if(activeFires.length < 1) {
            console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' and succeeded with code ' + chalk.cyan('200')));
            console.log(LogManagerClient.infoLog('Additional Information: This request returned successfully however there were no fires in the area.'))
            res.status(200).json({
                "message": "There are no active fires for this area."
            }).send()
            return;
        } else {
            console.log(LogManagerClient.infoLog('GET request sent to ' + chalk.cyan('/fires') + ' and succeeded with code ' + chalk.cyan('200')));
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
        console.log(LogManagerClient.infoLog('POST request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('400')));
        res.status(400).send();
        return;
    } else if(typeof locCode !== 'number' || typeof severity !== 'number' || typeof description !== 'string') {
        console.log(LogManagerClient.infoLog('POST request sent to ' + chalk.cyan('/fires') + ' but failed with code ' + chalk.cyan('400')));
        res.status(400).send();
        return;
    }

    let FireModelForLoc = await FireModel.findOne({ locCode: locCode });
    if(!FireModelForLoc) {
        let newModel = new FireModel({ 
            locCode: locCode,
            fires: [{ 
                id: 0,
                description: description,
                severity: severity,
                active: true,
                timestamp: Date.now(),
                humanFriendlyTimestamp: moment().format("HH:mma ddd D/M/YY"),
                instantiatedBy: auth 
            }],
            clients: [{
                id: -1
            }]
        });
        await newModel.save().catch(() => {
            res.status(500).send();
            console.log(LogManagerClient.errorLog('Error occurred while creating fire location code (POST)'))
            return;
        })
        console.log(LogManagerClient.infoLog('POST request sent to ' + chalk.cyan('/fires') + ' and returned with code ' + chalk.cyan('201')));
        console.log(LogManagerClient.infoLog(`Fire created at Location Code ${chalk.cyan(locCode)} with ID ${chalk.cyan('0')}`))
        return res.status(201).json({
            "message": `Fire created in location code ${locCode} with ID ${parseInt('0')}.`
        }).send()
    } else {
        let idNo;
        try {
            idNo = Number(FireModelForLoc.fires[FireModelForLoc.fires.length - 1].id + 1);
        } catch (error) {
            idNo = undefined
            console.log(LogManagerClient.errorLog('Unknown error occurred while grabbing fire ID Number in fire creation (POST).'));
            console.log(LogManagerClient.warnLog('Hint: Maybe database formatting issues in Location Code ' + chalk.cyan(locCode)) + '?');
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
            console.log(LogManagerClient.errorLog('Error occurred while saving fire (POST) in location code ' + chalk.cyan(locCode)));
            return;
        })
        console.log(LogManagerClient.infoLog('POST request sent to ' + chalk.cyan('/fires') + ' and returned with code ' + chalk.cyan('201')));
        console.log(LogManagerClient.infoLog(`Fire created at Location Code ${chalk.cyan(locCode)} with ID ${chalk.cyan(idNo.toString())}`))
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
        console.log(LogManagerClient.warnLog('User attempted to delete a location which didn\'t exist. Location ID ' + chalk.cyan(locCode)));
        return res.status(404).json({
            "message": "This location code does not exist in the database. \nThis generally means that either the code is invalid or no fires have ever occurred in the area."
        }).send();
    } else {
        await dbLoc.deleteOne().catch(err => {
            console.error(err)
            res.status(500).send();
        });
        console.log(LogManagerClient.warnLog('Location deleted with Location ID ' + chalk.cyan(locCode)));
        return res.status(200).send();
    }
})

app.patch('/fires', async (req, res) => {
    let auth = req.headers.authorization;
    if(!auth) return res.status(401).send();
    auth = await KeyModel.findOne({ key: auth });
    if(!auth) return res.status(401).send();
    if(auth.authLevel < 1) return res.status(401).send();

    let fireLoc = parseInt(req.query.locCode)
    let fireID = parseInt(req.query.id)
    let action = req.query.action

    if(!fireLoc || !fireID) return res.status(400).send();
    let locationDBEntry = await FireModel.findOne({ locCode: fireLoc });
    if(!locationDBEntry) return res.status(400).json({
        "message": "The provided fire location does not exist in the database."
    }).send();
    let specificFire = locationDBEntry.fires.find(element => element.id === fireID);
    if(!specificFire) return res.status(400).json({
        "message": "The specified fire ID does not exist in the database."
    }).send();

    switch (action) {
        case 'disable': {
            try {
                // await locationDBEntry.updateOne({ ['fires[' + Number(fireID - 1) + '].active']:false });
                locationDBEntry.fires[Number(fireID - 1)].active = false;
                locationDBEntry.save().catch((err) => {
                    res.status(500).json({
                        "error":err
                    }).send()
                    console.log(LogManagerClient.errorLog('Error occurred during fire disable while saving database to location code ' + chalk.cyan(fireLoc) + ' and fire ID' + chalk.cyan(fireID)));
                })
            } catch (error) {
                console.log(LogManagerClient.errorLog('Error occurred during fire disable while saving database to location code ' + chalk.cyan(fireLoc) + ' and fire ID' + chalk.cyan(fireID)));
                return res.status(500).json({
                    "error": error
                })
            }
            res.status(200).send()
        }
        break;
        case 'enable': {
            try {
                locationDBEntry.fires[Number(fireID - 1)].active = true;
                locationDBEntry.save().catch((err) => {
                    console.log(LogManagerClient.errorLog('Error occurred during fire enable while saving database to location code ' + chalk.cyan(fireLoc) + ' and fire ID' + chalk.cyan(fireID)));
                    return res.status(500).json({
                        "error":err
                    }).send()
                })
            } catch (error) {
                console.log(LogManagerClient.errorLog('Error occurred during fire enable while saving database to location code ' + chalk.cyan(fireLoc) + ' and fire ID' + chalk.cyan(fireID)));
                return res.status(500).send({
                    "error":error
                })
            }
            res.status(200).send();
        }
        break;
        default: {
            return res.status(400).send();
        }
    }
})

app.listen(process.env.PORT);
console.log(LogManagerClient.infoLog(`Listening on port ${process.env.PORT}`));
const server = http.createServer(app)
var io = sio(server);

io.on("connection", client => {
    console.log(client);
});

(async () => {
    connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true,
        useFindAndModify: false,
        useNewUrlParser: true
    }).then(() => {
        console.log(LogManagerClient.infoLog('DB Logged in.'))
    }).catch(() => {
        console.log(LogManagerClient.errorLog('DB Login failed.'));
        process.exit(0);
    })
})()