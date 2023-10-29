const mongoose = require('mongoose');
const { Schema } = require('mongoose');
class Patients {

    initSchema() {
        const schema = new Schema({
            'name': {
                'type': String,
                'required': true,
            },
            'mobileNo': {
                'type': String,
                'required': false,
            },
            'gender': {
                'type': String,
                'required': false,
            },
            'age': {
                'type': Number,
                'required': true,
            },
            'image': {
                'type': mongoose.Types.ObjectId,
                default: null
            }
        }, { 'timestamps': true });
        try {
            mongoose.model('patients', schema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('patients');
    }
}

module.exports = { Patients };
