export const requireAuth = (req, res, next) => {
    if (req.authError) {
        return res.status(401).json({ status: 'error', message: req.authError });
    }
    next();
};