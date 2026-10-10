import config from '../config/env.config.js';
import * as sessionsService from '../services/sessions.service.js';


import { CurrentUserDTO } from '../dto/current-user.dto.js';
import { ListUsersDTO } from '../dto/list-users.dto.js'; 
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { generateToken } from '../utils/jwt.js';

export const registerUser = asyncHandler(async (req, res) => {
    const userDTO = new CurrentUserDTO(await sessionsService.addUser(req.user));
    res.status(201).json( { status: 'success', payload: userDTO } );
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
    const userDTO = new CurrentUserDTO(req.user);
    res.status(200).json({ status: 'success',payload: userDTO });
});

export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('currentUser');
    res.status(200).json({ status: 'success', message: 'Logout exitoso' });
});

export const listUsers = asyncHandler(async (req,res) => {
    const resultados = await sessionsService.listUsers();
    if(resultados.length === 0){
        return res.status(200).json( { status: 'success', message: 'No hay usuarios registrados' } );
    }
    res.status(200).json( { status: 'success', payload: resultados.map( u => {
        return new ListUsersDTO(u);
    })});
})