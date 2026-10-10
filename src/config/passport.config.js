import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';

import * as sessionsService from '../services/sessions.service.js';

import config from '../config/env.config.js';

const cookieExtractor = req => {
    let token = null;
    if(req && req.cookies) token = req.cookies.currentUser;

    return token;
}

// estrategia para registrar un usuario
passport.use(
    'register',
    new LocalStrategy(    
        {
            usernameField: 'email',
            passReqToCallback: true,
        },
        async (req, email, password, done ) =>{
            try{
                const { first_name, last_name } = req.body;
                const resultado = await sessionsService.validateRegister( { first_name: first_name, last_name: last_name, email: email, password: password } );

                if(resultado?.message) return done(null, false, resultado);

                // Si pasa todas las validaciones, debe llegar hasta aca y continuar con el proceso de registro
                return done(null, resultado);
            }
            catch(error){
                return done(error);
            }
        }
    )
)

// estrategia para realizar un login
passport.use('login',
    new LocalStrategy(  
        {
            usernameField: 'email',
        },
        async (email, password, done) => {
            try{
                const resultado = await sessionsService.validateLogin( { email: email, password: password } );
                if(resultado?.message) return done(null, false, resultado)

                return done(null, resultado);
            }
            catch(error){
                return done(error);
            }
        }
    )
)

// estrategia para autenticar usuario ya logueado
passport.use('current',
    new JwtStrategy(
        {
            jwtFromRequest: cookieExtractor,
            secretOrKey: config.jwtSecret
        },
        async (jwtPayload, done) => {
            try{
                const currentUser = await sessionsService.getUserById(jwtPayload.id);

                if(currentUser?.message) return done(null, false, currentUser);
                
                return done(null, currentUser);
            }
            catch(error){
                return done(error);
            }
        } 
    )
)
