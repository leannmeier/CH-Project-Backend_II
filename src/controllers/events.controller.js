import * as eventsService from '../services/events.service.js';
import * as ticketsService from '../services/tickets.service.js';

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { printEvent } from '../utils/printEvent.js';
import { printTicket } from '../utils/printTicket.js';

export const getEvents = asyncHandler(async (req, res) => {
    const resultado = await eventsService.getAllEvents(req.query);
    if (resultado?.error) {
        const code = resultado.code;
        return res.status(code).json({ status: 'error', message: resultado.error });
    }
    res.status(200).json( { status: 'success', payload: resultado });
});

export const getEvent = asyncHandler(async (req, res) => {
    const { eid } = req.params;
    const resultado = await eventsService.getEvent(eid);
    if(resultado?.error){
        return res.status(404).json( { status: 'error', message: resultado.error } );
    }
    res.status(200).json( { status: 'success', payload: printEvent(resultado) });
});

export const addEvent = asyncHandler(async (req,res) => {
    const resultado = await eventsService.addEvent(req.body, req.user);
    if(resultado?.error){
        return res.status(400).json( { status: 'error', message: resultado.error } )
    }
    res.status(201).json( { status: 'success', payload: printEvent(resultado) });
});

export const updateEvent = asyncHandler(async (req, res) => {
    const { eid } = req.params;
    const resultado = await eventsService.updateEvent(eid, req.body, req.user);
    if (resultado?.error) {
        const status = resultado.code || 400;
        return res.status(status).json({ status: 'error', message: resultado.error });
    }
    res.status(200).json({ status: 'success', payload: printEvent(resultado) });
});

export const patchEvent = asyncHandler(async (req, res) => {
    const { eid } = req.params;
    const { status } = req.body;
    
    const resultado = await eventsService.patchEvent(eid, status, req.user);
    if (resultado?.error) {
        const code = resultado.code || 400;
        return res.status(code).json({ status: 'error', message: resultado.error });
    }
    res.status(200).json( { status: 'success', payload: printEvent(resultado) } );
});

export const getTickets = asyncHandler(async (req,res) => {
    const { eid } = req.params;
    const resultado = await ticketsService.getTickets(eid, req.user);
    if(resultado?.error){
        const code = resultado.code;
        return res.status(code).json( { status: 'error', message: resultado.error } );
    }
    // Pongo un condicional para los casos donde el evento existe pero no hay ningun ticket activo
    if(resultado.length === 0) return res.status(200).json( { status:'success', payload: 'Aun no tienes tickets' });
    
    res.status(200).json( { status:'success', payload: resultado.map(t => printTicket(t)) } );
})