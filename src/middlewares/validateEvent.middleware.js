export const validateEvent = (req, res, next) =>{
    
    const { title, description, date } = req.body;
    if( !title || !description || !date ) {
        return res.status(400).json( { status: 'error', message: 'Faltan campos' } )
    } 
    next();
}