export const validateUpdateEvent = (req, res, next) => {
    const { title, description, category, date, location, capacity, price } = req.body;

    if (!title || !description || !category || !date || !location || !capacity || price === undefined) {
        return res.status(400).json({ status: 'error', message: 'Como se trata de una actualización total, debes enviar todos los campos' });
    }

    if (title.trim() === '') {
        return res.status(400).json({ status: 'error', message: 'El título no puede estar vacío' });
    }
    if (description.trim() === '') {
        return res.status(400).json({ status: 'error', message: 'La descripción no puede estar vacía' });
    }
    if (category.trim() === '') {
        return res.status(400).json({ status: 'error', message: 'La categoría no puede estar vacía' });
    }
    if (isNaN(Date.parse(date))) {
        return res.status(400).json({ status: 'error', message: 'La fecha no es válida' });
    }
    if (location.trim() === '') {
        return res.status(400).json({ status: 'error', message: 'La ubicación no puede estar vacía' });
    }
    if(isNaN(capacity) || capacity < 1) {
        return res.status(400).json({ status: 'error', message: 'La capacidad debe ser un número positivo mayor a 0' });
    }
    if ((isNaN(price) || price < 0)) {
        return res.status(400).json({ status: 'error', message: 'El precio debe ser un número positivo' });
    }

    next();
};