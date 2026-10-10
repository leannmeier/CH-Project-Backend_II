export function errorHandler(error, req, res, next) {
    // Error cuando un ObjectId de MongoDB no tiene el formato correcto (ej: "123")
    if (error.name === 'CastError') {
        return res.status(400).json({ status: 'error', message: 'El ID proporcionado no tiene formato válido' });
    }

    // Error cuando se viola una regla del Schema (ej: un campo marcado como required que no se manda)
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ status: 'error', message: messages.join(', ') });
    }

    // Error de duplicidad en índices únicos (ej: intentar guardar un email o un índice unique que ya existe en la base de datos)
    if (error.code === 11000) {
        return res.status(409).json({ status: 'error', message: 'No puedes usar esas credenciales' });
    }
    console.error('Error no controlado:', error);

    // Respuesta generica para cualquier otro error
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
}