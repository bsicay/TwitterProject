'use strict'

var Usuario = require('../models/user');
var Tweet = require('../models/tweets');
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
const { find } = require('../models/user');


function addTweet(req, res){
    var tweet = new Tweet();
    var usuario = new Usuario();
    var params = req.body.commands;
    var command = params.split(' ');
    var id = req.user.sub;
    var tweetD = command[1]

    if(command[1]){
        Usuario.findById(id, (err, userEncontrado) => {
            if(err) return res.status(404).send({ message: 'Error al encontrar al usuario'})
            if(!userEncontrado) return res.status(500).send({ message: 'EL usuario no existe'})
            if(command.length>=3){
                for(let i=2; i<command.length;i++){
                    tweetD = tweetD + " " + command[i]
                }
            }
            tweet.Descripcion = tweetD;
            tweet.Likes = 0;
            tweet.Dislikes = 0;
            tweet.usuario = id; 
            tweet.nombreUsuario = userEncontrado.user;
            tweet.save((err, tweetGuardado)=>{
                if(err) return res.status(500).send({ message: 'Error al guardar el tweet'})
                if(tweetGuardado){
                    res.status(200).send({message: "Tweet añadido con exito!!"})
                }else{
                    res.status(404).send({message: 'Fallo al registrar usuario'})
                }
            })
        })
    }else{
        res.status(200).send({
            message: 'Rellene todos los datos necesarios'
        })
    }
}

function deteleTweet(req, res){
    var params = req.body.commands; 
    var command = params.split(' ');
    var tweetId = command[1];
    var userId = req.user.sub;

    if(command[1]){
        Tweet.findOne({_id: tweetId}, (err, tweetEncontrado)=>{
            if(tweetEncontrado){
                if(tweetEncontrado.usuario != userId) return res.status(500).send({message: 'No cuenta con el permiso de eliminar el tweet :/'})
                Tweet.findByIdAndDelete(tweetId, (err, tweetEliminado)=>{
                    if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                    if(!tweetEliminado) return res.status(404).send({message: 'Error al eliminar el tweet'})
                    return res.status(200).send({message: "Tweet Eliminado con Exito!!!"})
                })
            }else{
                return res.status(200).send({message: 'El tweet no existe :(('});
            }
        })
    }else{
        return res.status(400).send({message:"Complete los datos"})  
    }
}

function editTweet(req, res){
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');
    var tweetId = command[1];
    var newTweet = command[2];
    
    Tweet.findOne({_id: tweetId}, (err, tweetEncontrado)=>{
        if(tweetEncontrado.usuario != userId) return res.status(500).send({message: 'No cuenta con el permiso de eliminar el tweet :/'})
        if(command[1] && command[2]){
            if(command.length>=4){
                for(let i=3; i<command.length; i++){
                    newTweet = newTweet + " " + command[i]  
                }
            }
            Tweet.findByIdAndUpdate(tweetId, {Descripcion: newTweet}, {new:true}, (err, tweetEditado)=>{
                if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                if(!tweetEditado) return res.status(404).send({message: 'Este tweet no existe :(('})
                return res.status(200).send({message: "Tweet editado con exito!!"})
            })
        }else{
            return res.status(400).send({message:"Complete los datos"})
        }
    })
}

function viewTweets(req, res){ 
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');

    if(command[1]){
        Tweet.findOne({nombreUsuario: {$regex: command[1], $options: "i"}} , (err, tweetsEncontrado)=>{
            if(err) return res.status(500).send({ message: 'error en la peticion de tweets' })
            if(!tweetsEncontrado) return res.status(500).send({ message: 'Usuario no encontrado'})
            Tweet.find({nombreUsuario: {$regex: command[1], $options: "i"}}, (err, finded)=>{ 
                Usuario.findOne({_id: userId, 'following._id': tweetsEncontrado.usuario}, (err, userEncontrado)=>{
                       if(userEncontrado == null && tweetsEncontrado.usuario != userId){
                        return res.status(200).send({Message: "Debe de seguir a este usuario para poder ver sus Tweets"})
                       }else{
                        if(err) return res.status(500).send({ message: 'error en la peticion de tweets' })
                        if(!tweetsEncontrado) return res.status(404).send({ message: 'no se han podido listar los tweets' })
                        return res.status(200).send({Message: "Tweets de " + tweetsEncontrado.nombreUsuario, Tweets: finded})
                       }
                    })
            })
        })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

function likeTweet(req, res){
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');
    var tweetId = command[1];

    if(command[1]){
        Tweet.findOne({_id: tweetId}, (err, findedTweet) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion de tweets' })
            if(!findedTweet) return res.status(404).send({message: 'Este tweet no existe :(('})
            Usuario.findOne({_id: userId, 'following._id': findedTweet.usuario}, (err, userEncontrado)=>{
               if (err) res.status(500).send({ message: 'error en la peticion de tweets' })
               if(userEncontrado == null){
                   if(findedTweet.usuario == userId) return res.status(200).send({Message: "No puede dar like a su propio tweet"})  
                   return res.status(200).send({Message: "Debe de seguir a este usuario para poder dar like a sus Tweets"})  
               }else{
                for(let i = 0; i<findedTweet.listaReacciones.length; i++){
                    if(findedTweet.listaReacciones[i].idUsuario == userId)
                      return res.status(200).send({Message: "Ya le dio like a este tweet :))"})
                      var indice = findedTweet.listaReacciones[i].idUsuario;
                }
                if(indice != userId){
                    var likesAmount = findedTweet.Likes + 1;
                    Tweet.findOneAndUpdate({_id: tweetId},{Likes: likesAmount, $push:{listaReacciones:{idUsuario: userId, nombreUsuario: userEncontrado.user, like:true}}}
                        , {new:true}, (err, likedTweet)=>{ 
                            if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                            if(!likedTweet) return res.status(404).send({message: 'Este tweet no existe :(('})
                            return res.status(200).send({message: "Ha dado like al tweet de " + likedTweet.nombreUsuario})
                        })    
                }else{
                    return res.status(200).send({Message: "Ya le dio like a este tweet :)"})
                }
               }
           })
       })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

function dislikeTweet(req, res){
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');
    var tweetId = command[1];

    if(command[1]){
        Tweet.findOne({_id: tweetId}, (err, findedTweet) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion de tweets' })
            if(!findedTweet) return res.status(404).send({message: 'Este tweet no existe :(('})
            Usuario.findOne({_id: userId, 'following._id': findedTweet.usuario}, (err, userEncontrado)=>{
               if (err) res.status(500).send({ message: 'error en la peticion de tweets' })
               if(userEncontrado == null){
                   if(findedTweet.usuario == userId) return res.status(200).send({Message: "No puede dar dislike a su propio tweet"})  
                   return res.status(200).send({Message: "Debe de seguir a este usuario para poder dar like a sus Tweets"})  
               }else{
                for(let i = 0; i < findedTweet.listaReacciones.length; i++){
                     if(findedTweet.listaReacciones[i].idUsuario == userId){
                        var likesAmount = findedTweet.Likes - 1;
                        Tweet.findOneAndUpdate({_id: tweetId},{Likes: likesAmount, $pull:{listaReacciones:{idUsuario: userId}}}
                            , {new:true}, (err, dislikeTweet)=>{ 
                                if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                                if(!dislikeTweet) return res.status(404).send({message: 'Este tweet no existe :(('})
                                return res.status(200).send({message: "Ha dado dislike al tweet de " + dislikeTweet.nombreUsuario})
                            }) 
                     }
                     var indice = findedTweet.listaReacciones[i].idUsuario;
                }
                if(indice != userId) return res.status(200).send({message: "No ha dado like a este tweet"}) 
               }
           })
       })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

function replyTweet(req, res){
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');
    var tweetId = command[1];
    var comentario = command[2];

    if(command[1] && command[2]){
        if(command.length>=3){
            for(let i=2; i<command.length; i++){
                comentario = comentario + " " + command[i]  
            }
        }
        Tweet.findOne({_id: tweetId}, (err, findedTweet) =>{
            if(err) return res.status(500).send({ message: 'error en la peticion de tweets' })
            if(!findedTweet) return res.status(404).send({message: 'Este tweet no existe :(('})
            Usuario.findOne({_id: userId, 'following._id': findedTweet.usuario}, (err, userEncontrado)=>{
               if (err) res.status(500).send({ message: 'error en la peticion de tweets' })
               if(userEncontrado == null){ 
                   return res.status(200).send({Message: "Debe de seguir a este usuario para poder responder a sus Tweets"})  
               }else{
                Tweet.findOneAndUpdate({_id: tweetId},{$push:{replies:{idUsuario: userId, nombreUsuario: userEncontrado.user, comentario: comentario}}}
                    ,{new:true}, (err, repliedTweet)=>{ 
                        if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                        if(!repliedTweet) return res.status(404).send({message: 'Este tweet no existe :(('})
                        return res.status(200).send({Tweet: repliedTweet.Descripcion, Conversacion: repliedTweet.replies})
                    });
               }
           })
       })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

module.exports = {
    addTweet,
    deteleTweet, 
    editTweet,
    viewTweets,
    likeTweet,
    dislikeTweet,
    replyTweet
}

