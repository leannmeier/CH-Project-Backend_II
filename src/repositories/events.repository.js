import * as eventsDao from '../dao/events.dao.js';

export async function addEvent(event){
    return await eventsDao.create(event);
}

export async function getAll(options){
    return await eventsDao.getAll(options);
}

export async function findByTitleAndOrganizer(title, organizer){
    return await eventsDao.findByTitleAndOrganizer(title, organizer);
}

export async function findByIdPopulate(eid){
    return eventsDao.findByIdPopulate(eid);
}

export async function findById(eid){
    return await eventsDao.findById(eid);
}

export async function update(eid, eventData){
    return eventsDao.update(eid, eventData);
}
export async function patch(eid, status){
    return eventsDao.patch(eid, status);
}

