import { asyncHandler } from "../utils/asyncHandler.js";

export const getStatusServer = asyncHandler(async (req, res) =>{
    res.status(200).json( { status: 'ok', message: 'Servidor activo' } );
})