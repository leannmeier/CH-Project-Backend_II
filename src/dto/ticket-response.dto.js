export function printTicket(ticket) {
    return {
        id: ticket._id,
        code: ticket.reservationCode,
        user: {
            first_name: ticket.user.first_name,
            last_name: ticket.user.last_name,
            email: ticket.user.email
        },
        event: {
            title: ticket.event.title,
            description: ticket.event.description,
            date: ticket.event.date,
        },
        status: ticket.status,
        quantity: ticket.quantity
    }
}