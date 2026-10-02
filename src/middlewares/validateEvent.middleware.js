export const validateEvent = (req, res, next) =>{
    
    const { title, description, category, date, location, capacity, price } = req.body;
    if( !title || !description || !category || !date || !location || capacity === undefined || price === undefined ) {
        return res.status(400).json( { status: 'error', message: 'Faltan campos' } )
    } 
    next();
}