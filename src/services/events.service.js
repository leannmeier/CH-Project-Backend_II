import * as eventsRepository from '../repositories/events.repository.js';
import { STATUS_EVENTS } from '../constants/event.constants.js';

export async function getAllEvents(query = {}) {
    // Extraemos todos los posibles filtros
    let { status, category, location, dateFrom, dateTo, page = 1, limit = 10, sort } = query;

    // 1. validamos y parseamos la paginación
    let parsedPage = parseInt(page, 10);
    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 10;
    
    // POR LAS DUDAS: ponemos un limite maximo para evitar que colapse la base de datos en una sola consulta
    if (parsedLimit > 100) parsedLimit = 100;

    // 2. construir la queryDinamic
    const queryDinamic = {};

    // validamos status, category y location
    if (status) {
        if (!Object.values(STATUS_EVENTS).includes(status)) {
            return { error: `El estado '${status}' no es válido`, code: 400 };
        }
        queryDinamic.status = status;
    }
    if (category) queryDinamic.category = category;

    if (location) {
        queryDinamic.location = { $regex: location,$options: 'i' };
    }

    // 3. validar y filtrar el rango de fecha
    if (dateFrom || dateTo) {
        queryDinamic.date = {};
        if (dateFrom) {
            const parsedDateFrom = new Date(dateFrom);
            if (isNaN(parsedDateFrom.getTime())) {
                return { error: 'El formato de dateFrom es inválido', code: 400 };
            }
            queryDinamic.date.$gte = parsedDateFrom;
        }
        if (dateTo) {
            const parsedDateTo = new Date(dateTo);
            if (isNaN(parsedDateTo.getTime())) {
                return { error: 'El formato de dateTo es inválido', code: 400 };
            }
            queryDinamic.date.$lte = parsedDateTo;
        }
    }

    // 4. formatear ordenamiento
    let sortOption = { createdAt: -1 }; // default
    if (sort) {
        const [field, order] = sort.split(':');
        sortOption = { [field]: order === 'desc' ? -1 : 1 };
    }

    // 5. calculamos skip
    const skip = (parsedPage - 1) * parsedLimit;

    // 6. con los datos ya obtenidos, consultamos a la base de datos
    const { data, total } = await eventsRepository.getAll({
        query: queryDinamic,
        sort: sortOption,
        skip,
        limit: parsedLimit
    });

    // 7. calculamos el total de paginas
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    // Por ultimo, armamos la respuesta y la devolvemos
    return {
        data,
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages
    };
}

export async function getEvent(eid){
    const event = await eventsRepository.findByIdPopulate(eid);
    if(!event) return { error: 'No se encontro un evento con ese id', code: 404 };
    return event;
}

export async function createEvent(eventData, userData){
    // Validamos la fecha
    const eventDate = new Date(eventData.date);
    if(isNaN(eventDate.getTime()) || eventDate <= new Date() ) return { error: 'La fecha del evento debe ser posterior a la fecha actual', code: 400 };

    // Validamos que no haya titulo duplicado
    const normalizedTitle = eventData.title.toLowerCase().trim();
    const existingEvent = await eventsRepository.findByTitleAndOrganizer(normalizedTitle, userData._id);
    if(existingEvent) return { error: 'Ya tienes un evento registrado con ese mismo titulo', code: 409 };

    // validamos la categoria
    if(eventData.category === "") return { error: "La categoria no puede estar vacia", code: 400} ;

    // Validamos precio y capacidad
    if(eventData.price < 0 ) return { error: "El precio no puede ser negativo", code: 400 } ;
    if(eventData.capacity <= 0 ) return { error: "La capacidad no puede ser negativa o valer 0", code: 400 } ;

    const event = {
        title: normalizedTitle,
        description: eventData.description.trim(),
        category: eventData.category.toLowerCase().trim(),
        date: eventDate,
        location: eventData.location,
        capacity: eventData.capacity,
        price: eventData.price,
        organizer: userData._id
    }
    return await eventsRepository.createEvent(event);
}

export async function updateEvent(eid, eventData, userData) {
    // Primero verificamos si el evento existe
    const event = await eventsRepository.findById(eid);
    if (!event) return { error: 'No existe ese evento', code: 404 };

    // Luego, verificamos si quien realiza la petición es el propietario del evento o un admin
    const isOwner = event.organizer.toString() === userData._id.toString();
    const isAdmin = userData.role === 'admin';
    if (!isOwner && !isAdmin) return { error: 'No tienes permisos para realizar esa acción', code: 403 };

    // Luego, verificamos que la fecha sea posterior a la actual
    const eventDate = new Date(eventData.date);
    if(isNaN(eventDate.getTime()) || eventDate <= new Date()) return { error: 'La fecha del evento debe ser posterior a la fecha actual', code: 400 };
    
    // Luego, verificamos que el evento no esté cancelado
    if (event.status === STATUS_EVENTS.CANCELLED) return { error: 'No se puede modificar un evento cancelado', code: 400 };   
    
    // Luego, verificamos que el título no esté duplicado para el mismo organizador 
    const normalizedTitle = eventData.title.toLowerCase().trim();
    if (normalizedTitle !== event.title) {
        const duplicate = await eventsRepository.findByTitleAndOrganizer(normalizedTitle, event.organizer);
        if (duplicate) {
            return { error: 'Ya tienes otro evento registrado con ese mismo título', code: 400 };
        }
    }
    const updatePayload = {
        title: normalizedTitle,
        description: eventData.description.trim(),
        category: eventData.category.trim(),  
        date: eventDate,
        location: eventData.location,
        capacity: eventData.capacity,
        price: eventData.price
    }

    return await eventsRepository.updateEvent(eid, updatePayload);
}

export async function patchEvent(eid, status, userData) {
    // 1. Primero verifico que el evento exista
    const event = await eventsRepository.findById(eid);
    if (!event) return { error: 'Evento no encontrado', code: 404 };

    // 2. Verifico permisos (dueño o admin)
    const isOwner = event.organizer.toString() === userData._id.toString();
    const isAdmin = userData.role === 'admin';
    if (!isAdmin && !isOwner) return { error: 'No tienes permisos para realizar esta acción', code: 403 };

    // 3. Si el evento YA está cancelado, no se permite ninguna modificación
    if (event.status === STATUS_EVENTS.CANCELLED) {
        return { error: 'No se puede modificar un evento cancelado', code: 400 };
    }

    // 4. Si intentan publicarlo pero el estado actual YA es finalizado (se removió CANCELLED)
    if (status === STATUS_EVENTS.PUBLISHED && event.status === STATUS_EVENTS.FINISHED) {
        return { error: 'No se puede publicar un evento que ya ha finalizado', code: 400 };
    }

    // 5. Si todo está correcto, actualizamos el status
    return await eventsRepository.patchEvent(eid, status);
}