const hat = require('hat');
const { connect } = require('mongoose');
const KeyModel = require('./models/Key')
const dotenv = require('dotenv')
dotenv.config()
const key = hat();

(async () => {
    await connect(`mongodb+srv://flameless:${process.env.DBPASS}@cluster0.g2go6.mongodb.net/fireapi?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });
    console.log('DB logged in.');
})();

create()
console.log('Key created')

async function create() {
    if(await KeyModel.findOne({ key:key })) {
        // console.log(KeyModel.findOne({ key:key }))
        console.log('key already exists');
        process.exit(1);
    }
    
    else {
        let added = new KeyModel({ key:key });
        await added.save().catch(() => {
            console.log('Error ocurred');
            process.exit(1);
        })
    }
    return;
}