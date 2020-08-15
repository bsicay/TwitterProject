'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema; 

var RetweetsSchema = Schema({
    tweet: String,
    comentario: Number,
    nombreUsuario: String, 
    usuario: { type: Schema.ObjectId, ref: 'user'},
    nombreUsuario: String
})

module.exports = mongoose.model('retweets', RetweetsSchema)
