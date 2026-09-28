import * as sessionsDao from '../dao/sessions.dao.js';

export async function create(userData){
    return await sessionsDao.create(userData);
}
export async function findByEmail(email){
    return await sessionsDao.findByEmail(email);
}
export async function findById(id){
    return await sessionsDao.findById(id);
}
export async function findByEmailWithPassword(email){
    return await sessionsDao.findByEmailWithPassword(email);
}
export async function listUsers(){
    return await sessionsDao.listUsers();
}