'use strict';
const AppointmentController = require( '../controllers/AppointmentController' );
const express = require( 'express' )
const router = express.Router();
const AuthController = require( '../controllers/AuthController' );

router.post( '/add', AppointmentController.add );
router.post( '/update', AppointmentController.update );
router.post( '/all', AuthController.checkLogin, AppointmentController.getAll );
router.get( '/details/:id', AuthController.checkLogin, AppointmentController.get );
router.post( '/dashboard', AuthController.checkLogin, AppointmentController.dashboard );

module.exports = router;
