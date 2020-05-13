import { Request, Response, Router } from 'express';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';

import UserDao from '@daos/User/UserDao.mock';
import { paramMissingError } from '@shared/constants';
import { OAuth2 } from '@server';
import config from '../config';

// Init shared
const router = Router();
const userDao = new UserDao();


/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response) => {
    const users = await userDao.getAll();
    return res.status(OK).json({users});
});


/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post('/add', async (req: Request, res: Response) => {
    const { user } = req.body;
    if (!user) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    await userDao.add(user);
    return res.status(CREATED).end();
});


/******************************************************************************
 *                       Update - "PUT /api/users/update"
 ******************************************************************************/

router.put('/update', async (req: Request, res: Response) => {
    const { user } = req.body;
    if (!user) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError,
        });
    }
    user.id = Number(user.id);
    await userDao.update(user);
    return res.status(OK).end();
});


/******************************************************************************
 *                    Delete - "DELETE /api/users/delete/:id"
 ******************************************************************************/

router.delete('/delete/:id', async (req: Request, res: Response) => {
    const { id } = req.params as ParamsDictionary;
    await userDao.delete(Number(id));
    return res.status(OK).end();
});


/******************************************************************************
 *                    Get Videos - "GET /api/users/subscriptions"
 ******************************************************************************/

router.get('/subscriptions', (req: Request, res: Response) => {
    if (!req.cookies.jwt) {
        // We haven't logged in
        return res.redirect('/');
    }
    // Create an OAuth2 client object from the credentials in our config file
    const oauth2Client = new OAuth2(config.oauth2Credentials.client_id, config.oauth2Credentials.client_secret, config.oauth2Credentials.redirect_uris[0]);
    // Add this specific user's credentials to our OAuth2 client
    oauth2Client.credentials = jwt.verify(req.cookies.jwt, config.JWTsecret) as Credentials;
    // Get the youtube service
    const service = google.youtube('v3');
    // Get five of the user's subscriptions (the channels they're subscribed to)
    service.subscriptions.list({
        auth: oauth2Client,
        mine: true,
        part: 'snippet,contentDetails',
        maxResults: 5
    }).then(response => {

        return res.status(OK).json({subscriptions: response.data.items});
    });
});


/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
