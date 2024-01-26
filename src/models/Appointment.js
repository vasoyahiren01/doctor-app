const mongoose = require('mongoose');
const { Schema } = require('mongoose');
class Appointment {

    initSchema() {
        const schema = new Schema({
            'patient': {
                'type': mongoose.Types.ObjectId,
                'required': true,
            },
            'problem': {
                'type': String,
            },
            'prescription': {
                'type': String,
            },
            'attachments': {
                type: [mongoose.Types.ObjectId],
                default: []
            },
            'followUp': {
                'type': Date
            },
            'status': {
                'type': Number,
                default: 1 // 1 pending, 2 complete, 3 cancle
            },
            'isDeleted': {
                'type': Boolean,
                default: false
            },
        }, { 'timestamps': true });
        try {
            mongoose.model('appointment', schema);
        } catch (e) {

        }
    }

    getInstance() {
        this.initSchema();
        return mongoose.model('appointment');
    }
}

module.exports = { Appointment };
