import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';

export const generateToken = user => {
    return jwt.sign(user, config.jwtSecret, 
        { expiresIn: config.jwtExpiresIn },
    );
}

export const verifyToken = token => {
    return jwt.verify(token, config.jwtSecret);
}
