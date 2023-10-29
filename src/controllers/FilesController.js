const { FilesService } = require( './../services/FilesService' );
const { Files } = require( './../models/Files' );
// const autoBind = require( 'auto-bind' );
const multer = require( 'multer' );
const fs = require( 'fs' );
const utils = require( '../../system/helpers/Utility' ),
    config = require( '../../config/config' ).getConfig(),
    filesService = new FilesService(
        new Files().getInstance()
    );

class FilesController {

    // file upload using multer
    storage = multer.diskStorage( {
        'destination': function( req, file, cb ) {
            const dir = config.UPLOAD_PATH;

            fs.exists( dir, ( exist ) => {
                if ( !exist ) {
                    return fs.mkdir( dir, ( error ) => cb( error, dir ) );
                }
                return cb( null, dir );
            } );
        },
        'filename': function( req, file, cb ) {
            const fileOriginalName = utils.slugify( file.originalname );

            cb( null, `${( new Date() ).getTime() }-${ fileOriginalName}` );
        }
    } );
    upload = multer( {
        'storage': this.storage,
        'limits': {
            'fileSize': 1024 * 1024 * 5
        }
    } );

    async insert( req, res, next ) {
        try {
            const uploadPath = config.UPLOAD_PATH;

            req.file.path = req.file.path.split( `${uploadPath }/` )[ 1 ];
            const response = await filesService.insert( req.file );

            return res.status( response.statusCode ).json( response );
        } catch ( e ) {
            next( e );
        }
    }

    fileFilter = ( req, file, cb ) => {
        // reject a file
        if ( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' ) {
            cb( null, true );
        } else {
            cb( null, false );
        }
    };

    async delete( req, res, next ) {
        const { id } = req.params;

        try {
            const response = await filesService.delete( id );
            // File Unlinking..

            if ( response.data.path ) {
                console.log( 'unlink item', response.data.path );
                fs.unlink( response.data.path, ( err ) => {
                    if ( err ) {
                        console.log( 'error deleting file' );
                        throw err;
                    }
                    console.log( 'File deleted!' );
                } );
            }
            return res.status( response.statusCode ).json( response );
        } catch ( e ) {
            next( e );
        }
    }

    async get( req, res, next ) {
        const { id } = req.params;

        try {
            const response = await filesService.get( id );

            return res.status( response.statusCode ).json( response );
        } catch ( e ) {
            next( e );
        }
    }

}

module.exports = new FilesController( filesService );
