import nodemailer from 'nodemailer';

import config from './env.config.js';

export const transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
})