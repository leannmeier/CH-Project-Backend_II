import * as sessionRepository from '../repositories/sessions.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js';

import { 
        regex, MIN_CHARACTER, invalidFields, 
        invalidFormatEmail, invalidEmail, invalidFormatPassword,
        errorCredential, invalidUser } from '../constants/sessions.constants.js';

export async function addUser(userData){
    return await sessionRepository.createUser(userData);
}

export async function getUserById(id){
    const user = await sessionRepository.findById(id);
    return user ? user : invalidUser;
}

export async function listUsers(){
    return await sessionRepository.listUsers();
}

export async function validateRegister(user){
    // Verificamos que los campos existan
    if(!user.first_name || !user.last_name || !user.email || !user.password) return invalidFields

    // Normalizamos el email
    const normalizedEmail = user.email.toLowerCase().trim();
    if(!regex.test(normalizedEmail)) return invalidFormatEmail;

    // Validamos que no haya un usuario registrado con ese email
    const userExists = await sessionRepository.findByEmail(normalizedEmail);
    if(userExists) return invalidEmail;

    // Validamos la contraseña recibida (que tenga al menos 8 caracteres)
    if(user.password.length < MIN_CHARACTER) return invalidFormatPassword;

    // Una vez todo esta en condiciones, armo el oobjeto que sera guardado en req.user
    const securePassword = await hashPassword(user.password);
    return {
        first_name: user.first_name,
        last_name: user.last_name,
        email: normalizedEmail,
        password: securePassword,
    }
}

export async function validateLogin(user){
    // Normalizamos el email y buscamos el usuario
    const normalizedEmail = user.email.toLowerCase().trim();
    const existingUser = await sessionRepository.findByEmailWithPassword(normalizedEmail);
    if(!existingUser) return errorCredential;
    
    // Validamos la contraseña
    const validPassword = await comparePassword(user.password, existingUser.password);
    if(!validPassword) return errorCredential;

    return existingUser;
}