import mongoose from "mongoose";
import {genSalt, hash} from "bcrypt";

const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    image: {type: String, required: false, default: null},
    color: {type: Number, required: false},
    profileSetup: {type: Boolean, required: false},
    email: {type: String, required: [true, "Email is Required."], unique: true},
    password: {type: String, required: [true, "Password is Required."]},
})

UserSchema.pre("save", async function(next){
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
    next();
})

const UserModel = mongoose.model("User", UserSchema);

export{UserModel as User}
