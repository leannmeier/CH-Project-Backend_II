import * as sessionRepository from '../repositories/sessions.repository.js'
import { hashPassword } from '../utils/password.util.js';

const camposRequeridos = ['first_name', 'last_name', 'email', 'password'];

export async function addUser(userData){
    let user
    const faltantes = camposRequeridos.filter(c => {
        const valor = userData[c];
        return valor === undefined || valor === null || valor === '';
    })
    if(faltantes.length != 0){
        user = { error: `Faltan campos: ${faltantes.join(', ')}`}
        return user;
    }
    const { first_name, last_name, email, password } = userData;
    try{
        user =  await validateData(first_name, last_name, email, password);
    }
    catch(error){
        return { error: error.message};
    }
    const hastedPassword = await hashPassword(password);
    return await sessionRepository.create({ ...user, password: hastedPassword });
}

async function validateData(first_name, last_name, email, password){
    if(!first_name){
        throw new Error('Error al validar los datos. Nombre invalido');
    }
    if(!last_name){
        throw new Error('Error al validar los datos. Apellido invalido');
    }
    if(!validatePassword(password)){
        throw new Error('Error al validar los datos. Contraseña invalida');
    }
    const normalizedEmail = email.trim().toLowerCase();
    await validateEmail(normalizedEmail); 
    return {
        first_name: first_name,
        last_name: last_name,
        email: normalizedEmail,
        password: password
    }
}
async function validateEmail(email){
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!regex.test(email)){
        throw new Error('Error al validar los datos. Email invalido');
    }
    if(await verifyEmail(email)){
        throw new Error('Error al validar los datos. Email no aceptado');
    }
}
async function verifyEmail(email){
    return await sessionRepository.findByEmail(email);
}
function validatePassword(password){
    return password.length >= 8; 
}