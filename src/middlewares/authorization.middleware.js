export const authorization = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'No autenticado' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'No tienes permisos suficientes' });
        }
        next(); 
    };
};