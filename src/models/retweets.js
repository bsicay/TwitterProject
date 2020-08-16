'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema; 

var RetweetsSchema = Schema({
    tweet: String,
    comentario: String,
    nombreRetweet: String,
    usuarioOriginal: String, 
    nombreOriginal: String,
    usuario: { type: Schema.ObjectId, ref: 'user'},
})

module.exports = mongoose.model('retweets', RetweetsSchema)
