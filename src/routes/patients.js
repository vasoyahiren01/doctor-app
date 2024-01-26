'use strict';
const PatientsController = require( '../controllers/PatientsController' );
const express = require( 'express' ),
    router = express.Router();
const AuthController = require( '../controllers/AuthController' );

router.post( '/create', PatientsController.insert );

router.post( '/all', AuthController.checkLogin, PatientsController.getAll );
router.get( '/details/:id', AuthController.checkLogin, PatientsController.get );
// router.put( '/:id', PatientsController.update );
// router.delete( '/:id', PatientsController.delete );


module.exports = router;
