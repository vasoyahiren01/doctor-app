const mongoose = require('mongoose'),
    config = require('./config').getConfig();

// Mongo Connection Class
class Connection {
    constructor() {
        const url = config.MONGO_URL;

        mongoose.Promise = global.Promise;
        // mongoose.set( 'useNewUrlParser', true );
        // mongoose.set( 'useFindAndModify', false );
        // mongoose.set( 'useCreateIndex', true );
        // mongoose.set( 'useUnifiedTopology', true );

        this.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        }, (err) => {
            if (!err) {
                console.log('✔ Database Connected');
            } else {
                console.error('✘ MONGODB ERROR: ', err.message);
            }
        });

    }

    async connect(url) {
        try {
            console.log(url)
            await mongoose.connect(url);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = new Connection();
