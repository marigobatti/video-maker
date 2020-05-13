import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { OAuth2 } from '@server';
import { OK } from 'http-status-codes';


// Init shared
const router = Router();

/******************************************************************************
 *                     OAuth Login - "GET /login"
 ******************************************************************************/

router.get('/login', (req: Request, res: Response) => {
    const oauth2Client = new OAuth2(config.oauth2Credentials.client_id, config.oauth2Credentials.client_secret, config.oauth2Credentials.redirect_uris[0]);

    const loginLink = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Indicates that we need to be able to access data continously without the user constantly giving us consent
        scope: config.oauth2Credentials.scopes // Using the access scopes from our config file
    });

    return res.redirect(loginLink);
});

/******************************************************************************
 *                     OAuth Callback - "GET /auth_callback"
 ******************************************************************************/

router.get('/auth_callback', (req: Request, res: Response) => {
    // Create an OAuth2 client object from the credentials in our config file
    const oauth2Client = new OAuth2(config.oauth2Credentials.client_id, config.oauth2Credentials.client_secret, config.oauth2Credentials.redirect_uris[0]);

    if (req.query.error) {
        // The user did not give us permission.
        return res.redirect('/login');
    } else {
        oauth2Client.getToken(req.query.code.toString(), (err, token) => {
            if (err)
                return res.redirect('/login');

            // Store the credentials given by google into a jsonwebtoken in a cookie called 'jwt'
            if(token)
                res.cookie('jwt', jwt.sign(token, config.JWTsecret));

            return res.redirect('/api/users/subscriptions');
        });
    }
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
