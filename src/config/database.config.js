import mongoose from 'mongoose';
import config from "./env.config.js";

export const connectDB = async() => {
    try{
        await mongoose.connect(config.mongoUrl);
    }
    catch(error){
        console.error(`Hubo un error al conectarse con la base de datos: ${error.message}`);
        process.exit(1);
    }
}