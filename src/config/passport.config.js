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
        // Configuración de la estrategia
        {
            usernameField: 'email',
            passReqToCallback: true,
        },
        // Configuración de la estrategia
        async (req, email, password, done ) =>{
            try{
                // Toda la logica para verificar que se trate de un nuevo usuario a registrar

                // 1. Verificar que esten todos los campos minimos
                const { first_name, last_name } = req.body;

                if(!first_name || !last_name || !email || !password){
                    return done(
                        null, false,{
                            message: 'Faltan campos obligatorios'
                        }
                    );
                }

                // 2. Verificar que el email tenga el formato correcto
                const normalizedEmail = email.toLowerCase().trim();
                if(!regex.test(normalizedEmail)) return done(null, false, errorCredential);

                // 3. Verificar que el email sea unico en mi base de datos
                const userExists = await sessionRepository.findByEmail(normalizedEmail);
                if(userExists) return done(null, false, errorCredential);

                // 4. Verificar que la password tenga el minimo de caracteres correcto
                if(password.length < CANT_CARACTERES) return done(null, false, errorCredential);

                // 5. Hashear la password
                const securePassword = await hashPassword(password);

                // Ya todo validado, genero el nuevo usuario que sera enviado en req.user
                const newUser = {
                    first_name: first_name,
                    last_name: last_name,
                    email: normalizedEmail,
                    password: securePassword,
                    // No le pongo 'role' porque lo carga por defecto
                }
                return done(null, newUser);
            }
            catch(error){
                // Si genera un error interno, llegará hasta acá
                return done(error);
            }
        }
    )
)

// estrategia para realizar un login
passport.use('login',
    new LocalStrategy(  
        // Configuración de la estrategia
        {
            usernameField: 'email',
        },
        // Configuración de la estrategia 
        async (email, password, done) => {
            try{
                // 1. Verifico que exista el email y la contraseña 
                if(!email || !password){
                    return done(null, false, {
                        message: 'Error al iniciar sesión'
                    })
                }
                
                // 2. Normalizo el email y busco si existe un usuario con ese email
                const normalizedEmail = email.toLowerCase().trim();
                const user = await sessionRepository.findByEmailWithPassword(normalizedEmail);
                if(!user) return done(null, false, errorCredential);

                // 3. Verifico que la contraseña coincida
                const validPassword = await comparePassword(password, user.password);
                if(!validPassword) return done(null, false, errorCredential);
                
                // 4. Si llego hasta aca, es porque el usuario es correcto
                return done(null, user);
            }
            catch(error){
                // Si genera un error interno, llegará hasta acá
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
