export const validateUpdateEvent = (req, res, next) => {
    const { title, description, date } = req.body;

    // 1. Verificar que se envie al menos un campo para actualizar
    if (!title && !description && !date) return res.status(400).json({ status: 'error', message: 'Debes enviar al menos un campo para actualizar (title, description o date)' });

    // 2. Si un campo viene en la peticion, validar que no este vacio o en blanco
    if (title !== undefined && title.trim() === '') return res.status(400).json({ status: 'error', message: 'El título no puede estar vacío' });
    if (description !== undefined && description.trim() === '') return res.status(400).json({ status: 'error', message: 'La descripción no puede estar vacía' });

    next();
};