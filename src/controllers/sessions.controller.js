import * as sessionsService from '../services/sessions.service.js';
import { asyncHandler } from "../utils/asyncHandler.js";

import config from '../config/env.config.js';


export const registerUser = asyncHandler(async (req, res) => {
    let resultado = await sessionsService.addUser(req.body);
    if(resultado?.error){
        return res.status(400).json( { status: 'error', message: resultado.error } );
    }
    res.status(201).json( { status: 'success', payload: resultado } );
})

export const loginUser = asyncHandler(async (req, res) => {
    let resultado = await sessionsService.loginUser(req.body);  
    if(resultado?.error){
        return res.status(401).json( { status: 'error', message: resultado.error } );
    }
    res.cookie('currentUser', resultado, {
        httpOnly: true,
        maxAge: config.jwtExpiresIn * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json( { status: 'success', message: 'Login exitoso' } );
}); 

export const getCurrentUser = asyncHandler(async (req, res) => {
    const { id, email, role } = req.user;
    const user = {
        id: id,
        email: email,
        role: role
    }
    res.status(200).json({ status: 'success', payload: user });
});


export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Logout exitoso' });
});