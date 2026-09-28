export const authorization = (allowedRoles) => {
    return (req, res, next) => {
        // req.user ya fue cargado previamente por el middleware de autenticación
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado' });
        }
        // Verifico si el rol del usuario se encuentra en la lista de roles permitidos
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'No tienes permisos suficientes' });
        }
        // El usuario tiene permiso, continua
        next(); 
    };
};