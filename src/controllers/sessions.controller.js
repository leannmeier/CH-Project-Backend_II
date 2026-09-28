import config from '../config/env.config.js';
import * as sessionsService from '../services/sessions.service.js';

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { generateToken } from '../utils/jwt.js';

export const registerUser = asyncHandler(async (req, res) => {
    const resultado = await sessionsService.addUser(req.user);
    if(!resultado){
       return res.status(401).json( {status: 'error', message: 'No se pudo agregar al usuario'} )
    }

    res.status(201).json( { status: 'success', payload: {
        _id: resultado._id,
        first_name: resultado.first_name,
        last_name: resultado.last_name,
        email: resultado.email,
        role: resultado.role
    } } );
})

export const loginUser = asyncHandler(async (req, res) => {
    const userToken = {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
    }
    const token = generateToken(userToken);

    res.cookie('currentUser', token, {
        httpOnly: true,
        maxAge: config.jwtExpiresIn * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json( { status: 'success', message: 'Login exitoso' } );
}); 

export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        status: 'success',
        payload:{
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
        }
    })
});

export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Logout exitoso' });
});

export const listUsers = asyncHandler(async (req,res) => {
    const resultados = await sessionsService.listUsers();
    if(resultados?.error){
        return res.status(404).json( { status: 'error', message: resultados.error } );
    }
    res.status(200).json( { status: 'success', payload: resultados.map( u => {
        return {
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            role: u.role
        };
    })});
})