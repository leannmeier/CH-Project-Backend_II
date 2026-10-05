import { STATUS_EVENTS } from '../constants/event.constants.js';

export const validatePatchEvent = (req, res, next) => {
    const { status } = req.body;
    // Si no existe
    if (!status) return res.status(400).json({ status: 'error', message: 'El campo "status" es obligatorio' });

    // Si existe, pero no coincide con los estados permitidos
    if(!Object.values(STATUS_EVENTS).includes(status)) return res.status(400).json( { status:'error', message: `El estado '${status}' no es valido. Valores permitidos: ${Object.values(STATUS_EVENTS).join(', ')}` });
    
    // Si esta todo bien, sigue
    next();
}