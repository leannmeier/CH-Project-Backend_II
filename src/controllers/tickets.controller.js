import * as ticketsService from '../services/tickets.service.js';

import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import { printTicket } from '../utils/printTicket.js';

export const createTicket = asyncHandler(async (req, res) => {
    const { eid } = req.params;
    const resultado = await ticketsService.createTicket(eid, req.body, req.user);
    if(resultado?.error){
        const code = resultado.code || 400;
        return res.status(code).json( { status: 'error', message: resultado.error } );
    }
    res.status(201).json( { status: 'success', payload: printTicket(resultado) } );  
});

export const getMyTickets = asyncHandler(async (req,res) => {
    const resultado = await ticketsService.getMyTickets(req.user);
    if( resultado.length === 0) return res.status(200).json( { status: 'success', payload: 'No tienes tickets a tu nombre' } );
    res.status(200).json( { status: 'success', payload: resultado.map(t => printTicket(t)) } );  
});
export const cancelTicket = asyncHandler(async (req,res) => {
    const { tid } =  req.params;
    const resultado = await ticketsService.cancelTicket(tid, req.user);
    if(resultado?.error){
        const code = resultado.code || 400;
        return res.status(code).json( { status: 'error', message: resultado.error } );
    }
    res.status(200).json( { status: 'success', payload: printTicket(resultado) } );
});