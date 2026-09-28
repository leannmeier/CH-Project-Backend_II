import * as eventsRepository from '../repositories/events.repository.js'; 

export async function addEvent(eventData, userData){
    // La fecha del evento debe ser una fecha futura
    const eventDate = new Date(eventData.date);
    if(isNaN(eventDate.getTime()) || eventDate <= new Date() ){
        return { error: 'La fecha del evento debe ser posterior a la fecha actual' };
    }

    // Evitamos duplicados de eventos con el mismo nombre
    const normalizedTitle = eventData.title.toLowerCase().trim();
    const existingEvent = await eventsRepository.findByTitleAndOrganizer(normalizedTitle, userData._id);
    if(existingEvent){
        return { error: 'Ya tienes un evento registrado con ese mismo titulo' };
    }
    // Armo el objeto consistente para ser guardado
    const event = {
        title: normalizedTitle,
        description: eventData.description.trim(),
        date: eventDate,
        organizer: userData._id
    }

    return eventsRepository.addEvent(event);
}

export async function getAllEvents(){
    return eventsRepository.getAll();
}

export async function updateEvent(eid, eventData, userData) {
    // 1. Verifico que el evento exista
    const event = await eventsRepository.findById(eid);
    if (!event) return { error: 'No existe ese evento', code: 404 };

    // 2. Verifico permisos (dueño o admin)
    const isOwner = event.organizer.toString() === userData._id.toString();
    const isAdmin = userData.role === 'admin';

    if (!isOwner && !isAdmin) return { error: 'No tienes permisos para realizar esa acción', code: 403 };
    
    // 3. Armamos el payload construyendo solo las propiedades que se enviaron
    const updatePayload = {};

    // Si envió un nuevo título
    if (eventData.title) {
        const normalizedTitle = eventData.title.toLowerCase().trim();
        // Si el título cambió con respecto al actual, validamos duplicados
        if (normalizedTitle !== event.title) {
            const duplicate = await eventsRepository.findByTitleAndOrganizer(normalizedTitle, event.organizer);
            if (duplicate) {
                return { error: 'Ya tienes otro evento registrado con ese mismo título', code: 400 };
            }
        }
        updatePayload.title = normalizedTitle;
    }

    // Si envió descripción
    if (eventData.description) {
        updatePayload.description = eventData.description.trim();
    }

    // Si envió fecha
    if (eventData.date) {
        const eventDate = new Date(eventData.date);
        if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
            return { error: 'La fecha del evento debe ser posterior a la fecha actual', code: 400 };
        }
        updatePayload.date = eventDate;
    }
    return await eventsRepository.update(eid, updatePayload);
}

export async function deleteEvent(eid, userData){
    const event = await eventsRepository.findById(eid);
    if(!event) return { error: 'No existe ese evento', code: 404 };

    const isOwner = event.organizer.toString() === userData._id.toString();
    const isAdmin = userData.role === 'admin';
    if(!isAdmin && !isOwner) return { error: 'No tienes permisos para realizar esa acción', code: 403 }; 
    
    return await eventsRepository._delete(eid);
}
