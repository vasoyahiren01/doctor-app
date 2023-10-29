'use strict';
const { Service } = require( '../../system/services/Service' );

class PatientsService extends Service {
    constructor( model ) {
        super( model );
    }

}

module.exports = { PatientsService };
