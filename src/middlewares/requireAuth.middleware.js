export const requireAuth = (req, res, next) => {
    if (req.authError) {
        const status = req.authError.code || 401;
        return res.status(status).json({ status: 'error', message: req.authError.message });
    }
    next();
};