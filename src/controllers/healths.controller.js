import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

export const getStatusServer = asyncHandler(async (req, res) =>{
    res.status(200).json( { status: 'ok', message: 'Servidor activo' } );
})