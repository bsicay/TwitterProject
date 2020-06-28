'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema; 

var UserSchema = Schema({
    user: String, 
    password: String,
    tweets: [{
        Descripcion: String
    }],
    followers: [{
        User: String
    }],
    following: [{
        User: String
    }]
})

module.exports = mongoose.model('user', UserSchema)