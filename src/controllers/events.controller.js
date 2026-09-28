import * as eventsService from '../services/events.service.js';

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

export const getEvents = asyncHandler(async (req, res) => {
    const resultado = await eventsService.getAllEvents();
    if (resultado?.error) {
        return res.status(404).json({ status: 'error', message: resultado.error });
    }
    res.status(200).json( { status: 'success', payload: resultado.map( e => {
        return {
            title: e.title,
            description: e.description,
            date: e.date,
            organizer: e.organizer
        }})   
    } );
});

export const addEvent = asyncHandler(async (req,res) => {
    const resultado = await eventsService.addEvent(req.body, req.user);
    if(resultado?.error){
        return res.status(400).json( { status: 'error', message: resultado.error } )
    }
    res.status(201).json( { status: 'success', payload: {
        title: resultado.title,
        description: resultado.description,
        date: resultado.date,
        organizer: resultado.organizer
    }});
})


export const updateEvent = asyncHandler(async (req, res) => {
    const { eid } = req.params;
    const resultado = await eventsService.updateEvent(eid, req.body, req.user);
    if (resultado?.error) {
        const status = resultado.code || 400;
        return res.status(status).json({ status: 'error', message: resultado.error });
    }
    res.status(200).json({ status: 'success', payload: {
        title: resultado.title,
        description: resultado.description,
        date: resultado.date,
        organizer: resultado.organizer
    } });
});

export const deleteEvent = asyncHandler(async (req,res) => {
    const { eid } = req.params;
    const resultado = await eventsService.deleteEvent(eid, req.user);
    if (resultado?.error) {
        return res.status(resultado.code).json( { status: 'error', message: resultado.error } );
    }
    res.status(200).json({ status: 'success', payload: {
        title: resultado.title,
        description: resultado.description,
        date: resultado.date,
        organizer: resultado.organizer
    } });
});