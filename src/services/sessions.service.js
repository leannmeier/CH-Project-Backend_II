import * as sessionRepository from '../repositories/sessions.repository.js'

export async function addUser(userData){
    return await sessionRepository.create(userData);
}

export async function getUserById(id){
    return await sessionRepository.findById(id);
}

export async function listUsers(){
    return await sessionRepository.listUsers();
}