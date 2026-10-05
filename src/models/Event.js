import mongoose from 'mongoose';
import { STATUS_EVENTS } from '../constants/event.constants.js';

const eventSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: [true, 'El titulo es obligatorio'],
            trim: true
        },
        description: { 
            type: String, 
            required: [true, 'La descripción es obligatoria'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'La categoria es obligatoria'],
        },
        date: { 
            type: Date, 
            required: [true, 'La fecha del evento es obligatoria'],
        },
        location: {
            type: String, 
            required: [true, 'La ubicación es obligatoria'],
            trim: true,
        },
        capacity: {
            type: Number,
            min: [1, 'La capacidad nunca puede ser negativa. Ingresaste: {VALUE}'],
            required: true
        },
        price: {
            type: Number, 
            min: [0, 'El precio nunca puede ser negativo. Ingresaste: {VALUE}'],
            required: true
        },
        status: {
            type: String, 
            enum: Object.values(STATUS_EVENTS),
            default: STATUS_EVENTS.DRAFT,
        },
        organizer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user',
            required: [true, 'El organizador es obligatorio']
        }
    },
    { timestamps: true }
)

export const EventModel = mongoose.model('event', eventSchema);