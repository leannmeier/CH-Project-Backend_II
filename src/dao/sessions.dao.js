import { UserModel } from "../models/User.js";

export async function create(data){
    return await UserModel.create(data);
}
export async function findByEmail(email){
    return await UserModel.findOne({ email: email });
}
export async function findByEmailWithPassword(email) {
    return await UserModel.findOne({ email }).select('+password');
}