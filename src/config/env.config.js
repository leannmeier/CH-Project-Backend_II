import dotenv from 'dotenv';

dotenv.config();
const config = {
    port: Number(process.env.PORT) || 1234,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUrl: process.env.MONGO_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN) || 60,
}
if(!config.mongoUrl){
    console.error(`Error fatal: MONGO URL no esta definida`);
    process.exit(1);
}
if(!config.jwtSecret){
    console.error(`Error fatal: JWT SECRET no esta definida`);
    process.exit(1);
}       
console.log(`Configuración exitosa: ${config.nodeEnv}`);

export default config;
