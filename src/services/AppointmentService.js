'use strict';
const { Service } = require( '../../system/services/Service' );

class AppointmentService extends Service {
    constructor( model ) {
        super( model );
    }

}

module.exports = { AppointmentService };
