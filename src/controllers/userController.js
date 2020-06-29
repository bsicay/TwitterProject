'use strict'

var Usuario = require('../models/user')
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");

function addUser(req, res){
    var usuario = new Usuario();
    var params = req.body.commands; 
    var command = params.split('-');
    if(command[1]  && command[2]){
        usuario.user = command[1];
        usuario.password = command[2];
        Usuario.find({$or:[ 
            {user: command[1]},
            {password: command[2]}
        ]}).exec((err, usuarios)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de usuarios'})
            if(usuarios && usuarios.length >=1){
                return res.status(500).send({message: 'El usuario ya existe'})
            }else{
                bcrypt.hash(command[2], null, null, (err, hash)=>{
                    usuario.password = hash; 
                    usuario.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({ message: 'Error al guardar el alumno'})
                        if(usuarioGuardado){
                            res.status(200).send({usuario: usuarioGuardado})
                        }else{
                            res.status(404).send({message: 'Fallo al registrar usuario'})
                        }
                    })
                })
            }
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
  
}

function login(req, res){
    var params = req.body.commands; 
    var command = params.split("-");
    var boolValue = (command[3] == "true")

    if(command[1] && command[2]){
        Usuario.findOne({user: command[1]}, (err, userLog)=>{
            if(err) return res.status(400).send({ message: 'Error en la peticion'}) 
               if(userLog){
                   bcrypt.compare(command[2], userLog.password, (err, check)=>{
                       //console.log(check)
                       if(err) return res.status(500).send({message: "Error Inesperado"})
                       if(check){
                           if(boolValue){
                                return res.status(200).send({ token: jwt.createToken(userLog)})
                           }else{
                             userLog.password = undefined;
                             return res.status(200).send({Usuario: userLog })
                           }
                       }else{
                           return res.status(404).send({message: 'El usuario no se ha podido identificar..'})
                       }
                   })
               }else{
                   return res.status(404).send({ message: 'El usuario no se ha podido logear'})
               }
               })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

function profile(req, res){ //numero de seguidores y seguidos
    var params = req.body.commands; 
    var command = params.split("-");

    if(command[1]){
        Usuario.findOne({user: {$regex: command[1], $options: "i"}} , (err, perfilEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion del usuario' })
            if(!perfilEncontrado) return res.status(404).send({ message: 'El usuario no existe :(' })   
            return res
            .status(200).send({Message: "Perfil de " + perfilEncontrado.user 
            +  " | Usted sigue a " + perfilEncontrado.following.length + " Usuarios"
            + " |  Cuenta con " + perfilEncontrado.followers.length + " seguidor(es)", perfilEncontrado})  
        })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

function follow(req, res){
    var params = req.body.commands; 
    var command = params.split('-');
    var userId = req.user.sub

    if(command[1]){
        Usuario.findOne({user: {$regex: command[1], $options: "i"}} , (err, perfilEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion del usuario' })
            if(!perfilEncontrado) return res.status(404).send({ message: 'El usuario no existe :(' })
            if(perfilEncontrado._id == userId) return res.status(404).send({ message: 'No se puede seguir a usted mismo :/' })  
            Usuario.findOne({_id: userId, 'following._id': perfilEncontrado._id}, (err, userEncontrado)=>{
                if( userEncontrado == null){
                    Usuario.findByIdAndUpdate(userId, {$push:{following:{_id: perfilEncontrado._id, User: perfilEncontrado.user}}},
                        {new: true}, (err, userFollow)=>{
                            if(err)
                            return res.status(500).send({message:"Error en la peticion de usuario"})
                            if(!userFollow){
                                return res.status(404).send({message:"Error al seguir al usuario"})
                            }
                            followersPositive(req, perfilEncontrado._id);
                            return res.status(200).send({message:"Se ha seguido al usuario " + perfilEncontrado.user + ' con exito!'})
                        })
                }else{
                    return res.status(200).send({message: 'Ya sigue a este usuario!'})
                }
            }) 
        })
    }else{
        res.status(200).send({message: 'Rellene todos los datos necesarios'}) 
    }
   
}

function unfollow(req, res){
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split('-');

    if(command[1]){
        Usuario.findOne({user: {$regex: command[1], $options: "i"}} , (err, perfilEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion del usuario' })
            if(!perfilEncontrado) return res.status(404).send({ message: 'El usuario no existe :(' })    
                Usuario.findOne({_id: userId, 'following._id': perfilEncontrado._id}, (err, userEncontrado)=>{
                    if( userEncontrado == null){
                        return res.status(200).send({message: 'Usted no sigue a este usuario'})
                    }else{
                        Usuario.findOneAndUpdate({_id: userId},{ $pull: {following:{_id: perfilEncontrado._id}}}, {new:true}, (err, unfollowUser)=>{
                            if(err) return res.status(500).send({message: 'Error en la peticion del unfollow'})
                            if(!unfollowUser) return res.status(404).send({message: 'Error al dejar de seguir al usuario'})
                            followersNegative(req, perfilEncontrado._id);
                            return res.status(200).send({message:"Se ha dejado de seguir al usuario " + perfilEncontrado.user + ' con exito!'})
                        })
                    }
                })
        })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}
/*
function updateAmountFollows(req, res){
    Usuario.findById(req.user.sub , (err, perfilEncontrado)=>{   
        Usuario.findByIdAndUpdate(req.user.sub,{amountFollowing:perfilEncontrado.following.length},
            {new: true}, (err, userFollow)=>{
        })
    })
}

function updateAmountFollowers(req, res, id){
    Usuario.findById(id, (err, perfilEncontrado)=>{   
        Usuario.findByIdAndUpdate(id,{amountFollowers:perfilEncontrado.followers.length},
            {new: true}, (err, userFollow)=>{
        })
    })
}*/

function followersPositive(req,id){
    var userId = req.user.sub;
    var name = req.user.user;
    Usuario.findByIdAndUpdate(id, {$push:{followers:{_id: userId, User: name}}},{new: true}, (err, userFollow)=>{
        })
}

function followersNegative(req,id){
    var userId = req.user.sub;
    Usuario.findByIdAndUpdate(id, {$pull:{followers:{_id: userId}}},{new: true}, (err, userFollow)=>{
        })
}


module.exports = {
    addUser,
    login, 
    profile,
    follow,
    unfollow
}