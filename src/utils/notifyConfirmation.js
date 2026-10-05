import { transporter } from "../config/mailer.config.js";

import config from '../config/env.config.js';

export const notifyConfirmation = async (userData, eventData, ticket) => {
    await transporter.sendMail({
        from: config.mailFrom,
        to: userData.email,
        subject: 'Confirmación de inscripción',
        html: `
            <h1>Inscripción confirmada</h1>
            <p>Hola ${userData.first_name}, tu inscripción al evento ${eventData.title} fue confirmada.</p>
            <p>Código de reserva: <strong>${ticket.reservationCode}</strong></p>
        `
    })
};
