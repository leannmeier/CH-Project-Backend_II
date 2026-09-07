import * as sessionsDao from '../dao/sessions.dao.js';

export async function create(userData){
    return await sessionsDao.create(userData);
}
export async function findByEmail(email){
    return await sessionsDao.findByEmail(email);
}