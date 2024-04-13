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
                'type': String
            },
            'age': {
                'type': Number
            },
            'image': {
                'type': mongoose.Types.ObjectId,
                default: null
            },
            'procudure': {
                'type': Boolean,
                default: false
            },
            'isDeleted': {
                'type': Boolean,
                default: false
            },
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
