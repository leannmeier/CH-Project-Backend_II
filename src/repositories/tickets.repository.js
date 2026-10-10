import * as ticketsDao from '../dao/tickets.dao.js';

export async function createTicket(ticketData){
    return await ticketsDao.create(ticketData);
}

export async function findConfirmedTicketByUserAndEvent(userId, eventId){
    return await ticketsDao.findConfirmedTicketByUserAndEvent(userId, eventId);
}

export async function sumQuantityByEvent(eventId, status){
    return await ticketsDao.sumQuantityByEvent(eventId, status);
}

export async function findByReservationCode(reservationCode){
    return await ticketsDao.findByReservationCode(reservationCode);
}   

export async function getMyTickets(uid){
    return await ticketsDao.getMyTickets(uid);
}

export async function findTicketsByEvent(eid){
    return await ticketsDao.findTicketsByEvent(eid);
}

export async function findById(tid){
    return await ticketsDao.findById(tid);
}

export async function updateParcialTicket(id, status, cancelledAt){
    return await ticketsDao.updateParcialTicket(id, status, cancelledAt);
}