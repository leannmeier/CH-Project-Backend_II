import { EventModel } from '../models/Event.js';

export async function create(event) {
    return await EventModel.create(event);
}

export async function getAll({ query, sort, skip, limit }) {
    const events = await EventModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate('organizer', 'first_name last_name email role');
    const total = await EventModel.countDocuments(query);
    return {data: events, total: total};
}

export async function findByTitleAndOrganizer(title, organizer) {
    return await EventModel.findOne({ 
        title: title, 
        organizer: organizer 
    });
}

export async function findByIdPopulate(eid) {
    return await EventModel.findById(eid).populate({
        path: 'organizer'
    });
}

export async function findById(eid){
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

export async function patch(eid, status) {
    return await EventModel.findByIdAndUpdate(eid, 
        { status: status }, 
        { new: true }
    );
}