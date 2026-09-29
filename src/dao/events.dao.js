import { EventModel } from '../models/Event.js';

export async function create(event) {
    return await EventModel.create(event);
}

export async function getAll() {
    return await EventModel.find({}).populate({
        path: 'organizer'
    });
}

export async function findByTitleAndOrganizer(title, organizer) {
    return await EventModel.findOne({ 
        title: title, 
        organizer: organizer 
    });
}

export async function findById(eid) {
    return await EventModel.findById(eid);
}


export async function update(eid, eventData) {
    return await EventModel.findByIdAndUpdate(eid, eventData,
        { 
            new: true,       
            runValidators: true
        }
    );
}

export async function _delete(eid){
    return await EventModel.findByIdAndDelete(eid);
}