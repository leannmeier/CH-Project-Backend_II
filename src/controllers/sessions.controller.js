import * as sessionsService from '../services/sessions.service.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
    let resultado = await sessionsService.addUser(req.body);
    if(resultado?.error){
        return res.status(400).json( { status: 'error', message: resultado.error } );
    }
    res.status(201).json( { status: 'success', payload: resultado } );
})