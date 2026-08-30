import { asyncHandler } from "../utils/asyncHandler.js";

export const getSessions = asyncHandler(async (req, res) =>{
    res.status(200).json( { status: 'success', payload: [] } );
})