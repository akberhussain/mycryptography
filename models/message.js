var mongoose = require("mongoose");

    // creating Modelschema for comments
    
var messageSchema = new mongoose.Schema({
    message: String,
    key: String,
    givenKey: {type: String, default: "123456789"},
    created : {type : Date , default : Date.now()},
    author : {
        id: {
           type : mongoose.Schema.Types.ObjectId,
           ref  : "User"
        },
        username: String
    },
    reciever : {
        id: {
           type : mongoose.Schema.Types.ObjectId,
           ref  : "User"
        },
        username: String
    }
});

    // compiling a commentSchema into a Model and exporting to app.js

module.exports =  mongoose.model("Message", messageSchema);