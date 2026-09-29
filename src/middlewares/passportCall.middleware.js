import passport from 'passport';

export const passportCall = (strategy) =>{
    return (req, res, next) =>{
        passport.authenticate(strategy, { session: false }, (err, user, info) => {
            if(err) return next(err);

            if(!user){
                req.authError = info;
                return next();
            }
            req.user = user;
            return next();
        })(req, res, next);
    };
};