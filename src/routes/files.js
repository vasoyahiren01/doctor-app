'use strict';
const FilesController = require( '../controllers/FilesController' );
const express = require( 'express' ),
    router = express.Router();
const AuthController = require( '../controllers/AuthController' );

router.get( '/:id', AuthController.checkLogin, FilesController.get );
router.post( '/add', [ AuthController.checkLogin, FilesController.upload.single( 'file' ) ], FilesController.insert );
router.delete( '/:id', AuthController.checkLogin, FilesController.delete );


module.exports = router;
