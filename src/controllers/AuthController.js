const { AuthService } = require('./../services/AuthService');
const { Auth } = require('./../models/Auth');
const { User } = require('./../models/User');
// const autoBind = require( 'auto-bind' );
const bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    authService = new AuthService(
        new Auth().getInstance(), new User().getInstance()
    );

class AuthController {

    async login(req, res, next) {
        try {
            const response = await authService.login(req.body.email, req.body.password);

            await res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async register(req, res, next) {
        try {
            const registeredUserData = await authService.register(req.body);
            await res.status(200).json(registeredUserData);
        } catch (e) {
            next(e);
        }
    }


    async changePassword(req, res, next) {
        try {
            const id = req.user._id;

            bcrypt.genSalt(SALT_WORK_FACTOR, async (err, salt) => {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(req.body.password, salt, async (hashErr, hash) => {
                    if (hashErr) {
                        return next(hashErr);
                    }
                    const data = { 'password': hash },
                        response = await authService.changePassword(id, data);

                    await res.status(response.statusCode).json(response);
                });
            });
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const response = await authService.logout(req.token);

            await res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }

    async checkLogin(req, res, next) {
        try {
            let token = null;
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                token =  req.headers.authorization.split(' ')[1];
            } else if (req.query && req.query.token) {
                token = req.query.token;
            }
            req.user = await authService.checkLogin(token);
            req.authorized = true;
            req.token = token;
            next();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AuthController(authService);
