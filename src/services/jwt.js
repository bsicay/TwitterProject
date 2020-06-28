'use strict'

var jwt = require("jwt-simple")
var moment = require("moment")
var secret ="clave_secreta_usuario"

exports.createToken = function (user){
    var payload = {
        sub: user.id, 
        user: user.user, 
        password: user.password,
        iat: moment().unix(), 
        exp: moment().day(30, 'days').unix()
    }
    return jwt.encode(payload, secret)
}