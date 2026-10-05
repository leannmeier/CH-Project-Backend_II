export const validateTicket = (req,res,next) => {
    const { quantity } = req.body;
    if(!req.params.eid || quantity === undefined){
        return res.status(400).json({ error: 'Datos del ticket inválidos' });
    }
    if ((isNaN(quantity) || quantity <= 0)) {
        return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo' });
    }
    next();
}