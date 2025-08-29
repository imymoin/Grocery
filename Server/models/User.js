import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type : String,
        required: true
    },
    email:{type: String,
        required: true
    },
    password:{type: String,
        required: true
    },
    cartItems:{
        type: Object,
        required: false,
    },
},{minimize: false})

const User = mongoose.model.User || mongoose.model("User", userSchema);
export default User;