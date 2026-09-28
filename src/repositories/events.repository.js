import * as eventsDao from '../dao/events.dao.js';

export async function addEvent(event){
    return await eventsDao.create(event);
}

export async function getAll(){
    return await eventsDao.getAll();
}

export async function findByTitleAndOrganizer(title, organizer){
    return await eventsDao.findByTitleAndOrganizer(title, organizer);
}

export async function findById(eid){
    return eventsDao.findById(eid);
}

export async function update(eid, eventData){
    return eventsDao.update(eid, eventData);
}

export async function _delete(eid){
    return eventsDao._delete(eid);
}