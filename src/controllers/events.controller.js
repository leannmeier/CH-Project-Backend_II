import { asyncHandler } from "../utils/asyncHandler.js";

export const getEvents = asyncHandler(async (req, res) =>{
    res.status(200).json( { status: 'success', payload: [] } );
})