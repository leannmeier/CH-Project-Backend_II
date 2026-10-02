export function printEvent(event){
    return {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        price: event.price,
        status: event.status,
        organizer: {
            id: event.organizer._id,
            first_name: event.organizer.first_name,
            last_name: event.organizer.last_name,
            email: event.organizer.email,
            role: event.organizer.role,
        }
    }
}