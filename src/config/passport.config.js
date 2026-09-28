import passport from 'passport'

import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { hashPassword, comparePassword } from '../utils/hash.js';

import * as sessionRepository from '../repositories/sessions.repository.js';
import config from '../config/env.config.js';

const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
const CANT_CARACTERES = 8;
const errorCredential = {
    status: 'error',
    message: 'Credenciales invalidas'
};

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

                if(!first_name || !last_name || !email || !password){
                    return done(
                        null, false,{
                            message: 'Faltan campos obligatorios'
                        }
                    );
                }

                const normalizedEmail = email.toLowerCase().trim();
                if(!regex.test(normalizedEmail)) return done(null, false, errorCredential);

                const userExists = await sessionRepository.findByEmail(normalizedEmail);
                if(userExists) return done(null, false, errorCredential);

                if(password.length < CANT_CARACTERES) return done(null, false, errorCredential);

                const securePassword = await hashPassword(password);

                const newUser = {
                    first_name: first_name,
                    last_name: last_name,
                    email: normalizedEmail,
                    password: securePassword,
                }
                return done(null, newUser);
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
                if(!email || !password){
                    return done(null, false, {
                        message: 'Error al iniciar sesión'
                    })
                }

                const normalizedEmail = email.toLowerCase().trim();
                const user = await sessionRepository.findByEmailWithPassword(normalizedEmail);
                if(!user) return done(null, false, errorCredential);

                const validPassword = await comparePassword(password, user.password);
                if(!validPassword) return done(null, false, errorCredential);
                
                return done(null, user);
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
                const user = await sessionRepository.findById(jwtPayload.id);
                if(!user){
                    return done(null, false, {
                        message: 'Usuario no encontrado'
                    });
                } 
                return done(null, user);
            }
            catch(error){
                return done(error);
            }
        } 
    )
)
