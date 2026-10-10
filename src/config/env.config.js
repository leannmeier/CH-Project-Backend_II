import dotenv from 'dotenv';

dotenv.config();
const config = {
    port: Number(process.env.PORT) || 1234,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUrl: process.env.MONGO_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN) || 60,
    mailHost: process.env.MAIL_HOST,
    mailPort: Number(process.env.MAIL_PORT),
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    mailFrom: process.env.MAIL_FROM,
    
}
if(!config.mongoUrl){
    console.error(`Error fatal: MONGO URL no esta definida`);
    process.exit(1);
}
if(!config.jwtSecret){
    console.error(`Error fatal: JWT SECRET no esta definida`);
    process.exit(1);
}
if(!config.mailHost){
    console.error(`Error fatal: MAIL HOST no esta definida`);
    process.exit(1);
}
if(!config.mailPort){
    console.error(`Error fatal: MAIL PORT no esta definida`);
    process.exit(1);
} 
if(!config.mailUser){
    console.error(`Error fatal: MAIL USER no esta definida`);
    process.exit(1);
} 
if(!config.mailPass){
    console.error(`Error fatal: MAIL PASS no esta definida`);
    process.exit(1);
} 
if(!config.mailFrom){
    console.error(`Error fatal: MAIL FROM no esta definida`);
    process.exit(1);
}       

export default config;
