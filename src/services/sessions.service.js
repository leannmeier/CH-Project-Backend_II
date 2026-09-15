import * as sessionRepository from '../repositories/sessions.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

const camposRequeridos = ['first_name', 'last_name', 'email', 'password'];
const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  

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
    const securePassword = await hashPassword(password);
    return await sessionRepository.create({ ...user, password: securePassword });
}

export async function loginUser(userData){
    const { email, password } = userData;  

    // Validar campos
    if(!email || !password){
        return { error: 'Faltan campos obligatorios' };
    }

    // Normalizar / validar email
    const normalizedEmail = email.trim().toLowerCase();
    if(!regex.test(normalizedEmail)){
        return { error: 'Credenciales inválidas' };
    }

    // Buscar usuario en la base de datos
    const user = await sessionRepository.findByEmailWithPassword(normalizedEmail);
    if(!user){
        return { error: 'Credenciales inválidas' };
    }

    // Validar contraseña (funcion)
    const validPassword = await comparePassword(password, user.password);
    if(!validPassword){
        return { error: 'Credenciales inválidas' };
    }

    // Generar token
    const userToken = {
        id: user._id,
        email: user.email,
        role: user.role
    }
    return generateToken(userToken);
}

// metodos auxiliares
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
    if(!regex.test(email)){
        throw new Error('Error al validar los datos. Email invalido');
    }
    if(await emailExists(email)){
        throw new Error('Error al validar los datos. Email no aceptado');
    }
}

async function emailExists(email){
    return await sessionRepository.findByEmail(email);
}

function validatePassword(password){
    return password.length >= 8; 
}