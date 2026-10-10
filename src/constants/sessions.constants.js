// Constantes del negocio
export const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
export const MIN_CHARACTER = 8;

export const invalidFields = {
    message: 'Faltan campos obligatorios',
    code: 400
}
export const invalidFormatEmail = {
    message: 'Formato de email invalido',
    code: 400
}
export const invalidEmail = {
    message: 'email no permitido',
    code: 409
}
export const invalidFormatPassword = {
    message: `La contraseña debe tener al menos ${MIN_CHARACTER} caracteres`,
    code: 400
}
export const errorCredential = {
    message: 'Credenciales invalidas',
    code: 401 
}
export const invalidUser = {
    message: 'Usuario no encontrado',
    code: 401
}
// Constantes del negocio