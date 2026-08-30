import dotenv from 'dotenv';

dotenv.config();
const config = {
    port: Number(process.env.PORT) || 1234,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUrl: process.env.MONGO_URL
}
if(!config.mongoUrl){
    console.error(`Error fatal: MONGO URL no esta definida`);
    process.exit(1);
}
console.log(`Configuración exitosa: ${config.nodeEnv}`);

export default config;
