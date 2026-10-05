import * as ticketsRepository from '../repositories/tickets.repository.js';
import * as eventsRepository from '../repositories/events.repository.js';

import { STATUS_EVENTS } from '../constants/event.constants.js';
import { STATUS_TICKETS } from '../constants/ticket.constants.js';
import { notifyConfirmation } from '../utils/notifyConfirmation.js';

export async function createTicket(eid, ticketData, userData){
    const { quantity } = ticketData;

    // Validamos que la cantidad sea positiva 
    if (Number(quantity) <= 0) {
        return { error: `Error al elegir la cantidad de cupos. (valor recibido: ${quantity})`, code: 400 };
    }

    // Verificamos la existencia del evento
    const event = await eventsRepository.findById(eid);
    if (!event) return { error: 'No existe ese evento', code: 404 };

    // Verificamos estado del evento
    if (event.status !== STATUS_EVENTS.PUBLISHED) {
        return { error: 'El evento al que se quiere inscribir no se encuentra disponible', code: 400 };
    }

    // Verificamos si el usuario ya posee un ticket activo para este evento
    const existingTicket = await ticketsRepository.findConfirmedTicketByUserAndEvent(userData._id, eid);
    if (existingTicket) {
        return { error: 'Ya tienes un ticket activo para este evento', code: 400 };
    }

    // Calculamos los cupos ocupados (sumando el campo quantity) y disponibles
    const cuposOcupados = await ticketsRepository.sumQuantityByEvent(eid, STATUS_TICKETS.CONFIRMED);
    const cuposDisponibles = event.capacity - (cuposOcupados || 0);

    if (cuposDisponibles < quantity) {
        return { error: `No hay suficiente capacidad disponible. Quedan ${cuposDisponibles} cupos`, code: 400 };
    }

    // Creamos una funcion para generar codigos alfanumericos aleatorios para los tickers

    const generateTicketCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const generateBlock = () => {
            let block = '';
            for (let i = 0; i < 4; i++) {
                block += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return block;
        }
        return `TKT-${generateBlock()}-${generateBlock()}-${generateBlock()}-${generateBlock()}`;
    }

    // Como existe una posibilidad muy pequeña de que se genere un codigo duplicado
    // Vamos a corroborar que no exista en la base de datos antes de crear el ticket
    let reservationCode;
    let isUnique = false;
    while (!isUnique) {
        reservationCode = generateTicketCode();
        const existingTicket = await ticketsRepository.findByReservationCode(reservationCode);
        if (!existingTicket) {
            isUnique = true;
        }
    }

    const ticket = {
        user: userData._id,
        event: event._id,
        status: STATUS_TICKETS.CONFIRMED,
        quantity: quantity,
        reservationCode: reservationCode,
        createdAt: new Date(),
        cancelledAt: null
    };

    const newTicket = await ticketsRepository.create(ticket);
    
    // Notificamos al comprador por email
    try{
        await notifyConfirmation(userData, event, newTicket);
    }
    catch(error){
        console.error('Error al enviar el email de confirmación:', error);
    }

    return newTicket;
}

export async function getMyTickets(userData) {
    // Bucamos si existe un ticket con este usuario
    const ticket = await ticketsRepository.getMyTickets(userData._id);
    if(!ticket) return { error: 'No se encontraron tickets para este usuario ', code: 200};

    // Devuelvo los tickets encontrados
    return ticket;
}

export async function getTickets(eid, userData){
    // primero, verificamos que el evento exista
    const event = await eventsRepository.findById(eid);
    if(!event) return { error: 'No se registra ese evento en el sistema ', code: 404 }

    // En este punto, sabemos que el evento existe y quien realiza la petición es un organizador o un admin.
    // Si es un organizador, debemos verificar que sea el propietario del evento
    const isOwner = event.organizer.toString() === userData._id.toString();
    const isAdmin = userData.role === 'admin';
    if (!isAdmin && !isOwner) return { error: 'No tienes permisos para realizar esta acción', code: 403 };

    return await ticketsRepository.findTicketsByEvent(eid);
}

export async function cancelTicket(tid, userData){
    // Primero, verificamos si el ticket existe
    const ticket = await ticketsRepository.findById(tid);
    if(!ticket) return { error: 'No existe ese ticket', code: 404 };

    // Verificamos si quien realiza la petición es el dueño del ticket o un admin
    const isOwner = ticket.user.toString() === userData._id.toString();
    const isAdmin = userData.role === 'admin';
    if (!isAdmin && !isOwner) return { error: 'No tienes permisos para realizar esta acción', code: 403 };

    // Verificamos si el ticket no se encuentra cancelado
    if(ticket.status.toString() !== STATUS_TICKETS.CONFIRMED) return { error: 'El ticket al que quiere acceder ya se encuentra cancelado', code: 400 };

    // Todo en condiciones, seteamos la nueva info. status: cancelled y cancelledAt con la fecha de hoy
    const cancelledDate = new Date();

    return await ticketsRepository.updateParcialTicket(ticket._id, STATUS_TICKETS.CANCELLED, cancelledDate );
}