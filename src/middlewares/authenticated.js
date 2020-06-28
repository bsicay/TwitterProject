'use strict'

var jwt = require("jwt-simple")
var secret = "clave_secreta_usuario"
var moment = require("moment")


exports.ensureAuth = function (req, res, next){
    var params = req.body.commands; 
    var keyWord = params.split('-');

    if(!req.headers.authorization){
        if(keyWord[0].toLowerCase() == 'register' || keyWord[0].toLowerCase() == 'login'){
            next();
        }else{
            return res.status(403).send({message: 'La peticion no tiene la cabecera de autentificacion o el comando no es valido'})
        }
    }else{
        var token = req.headers.authorization.replace(/['"]+/g, '')
        try{
            var payload =jwt.decode(token, secret)
            if(payload.exp <= moment().unix()){
                return res.status(401).send({
                    message: 'El token ha expirado'
                })
            }
        }catch(ex){
            return res.status(404).send({
                message: 'El token no es valido'
            })
        }
        req.user = payload;
        next();
    }
}

