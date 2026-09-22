import * as sessionRepository from '../repositories/sessions.repository.js'

export async function addUser(userData){
    return await sessionRepository.create(userData);
}