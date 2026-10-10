import mongoose from "mongoose";

import { TicketModel } from "../models/Ticket.js";
import { STATUS_TICKETS } from "../constants/ticket.constants.js";

export async function create(ticketData) {
    const newTicket = await TicketModel.create(ticketData);
    return await newTicket.populate(['user', 'event']);
}

export async function findConfirmedTicketByUserAndEvent(userId, eventId){
    return await TicketModel.findOne({
        user: userId,
        event: eventId,
        status: STATUS_TICKETS.CONFIRMED
    })
}

export async function sumQuantityByEvent(eventId, status){
    const result = await TicketModel.aggregate([
        {
            $match: {
                event: new mongoose.Types.ObjectId(eventId),
                status: status
            }
        },
        {
            $group: {
                _id: null,
                totalQuantity: { $sum: "$quantity" }
            }
        }
    ]);
    return result.length > 0 ? result[0].totalQuantity : 0;
}

export async function findByReservationCode(reservationCode){
    return await TicketModel.findOne({ reservationCode: reservationCode });
}

export async function getMyTickets(uid){
    return await TicketModel.find({user: uid}).populate(['user', 'event']);
}

export async function findTicketsByEvent(eid){
    return await TicketModel.find(
        { event: eid }
    ).populate(['user', 'event']);
}

export async function findById(tid){
    return await TicketModel.findById(tid);
}

export async function updateParcialTicket(id, status, cancelledAt){
    return await TicketModel.findByIdAndUpdate(id, 
        { 
            status: status,
            cancelledAt: cancelledAt
         }, { new: true }
    ).populate(['user', 'event']);
}
