import mongoose from "mongoose";
import { STATUS_TICKETS } from "../constants/ticket.constants.js";

const ticketSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId, ref: 'user',
            required: [true, 'Un ticket no puede existir sin un usuario asociado']
        },
        event:{
            type: mongoose.Schema.Types.ObjectId, ref: 'event',
            required: [true, 'Un ticket no puede existir sin un evento asociado']
        },
        status:{
            type: String,
            enum: Object.values(STATUS_TICKETS),
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        reservationCode: {
            type: String,
            unique: true
        },
        createdAt: {
            type: Date,
            default: null
        },
        cancelledAt: {
            type: Date,
            default: null
        }
    }, { timestamps: true }
)

export const TicketModel = mongoose.model('ticket', ticketSchema);