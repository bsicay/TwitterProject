'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema; 

var TweetsSchema = Schema({
    Descripcion: String,
    Likes: Number,
    listaReacciones:[{
        idUsuario: { type: Schema.ObjectId, ref: 'user'},
        nombreUsuario: String
    }],
    replies:[{
        idUsuario: {type: Schema.ObjectId, ref:'user'},
        nombreUsuario: String,
        comentario: String, 
    }],
    usuario: { type: Schema.ObjectId, ref: 'user'},
    nombreUsuario: String,
})

module.exports = mongoose.model('tweets', TweetsSchema)