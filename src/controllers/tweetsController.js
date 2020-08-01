'use strict'

var Usuario = require('../models/user')
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");


function addTweet(req, res){
    var params = req.body.commands;
    var command = params.split(' ');
    var id = req.user.sub;
    var tweetD = command[1]

    if(command[1]){
        if(command.length>=3){
            for(let i=2; i<command.length;i++){
                tweetD = tweetD + " " + command[i]
            }
        }
        Usuario.findByIdAndUpdate(id, {$push:{tweets:{Descripcion: tweetD}}},
            {new: true}, (err, saveTweet)=>{
                if(err)
                return res.status(500).send({message:"Error en la peticion de tweet"})
                if(!saveTweet){
                    return res.status(404).send({message:"El tweet no se pudo agregar"})
                }
                return res.status(200).send({message:"tweet añadido"})
            }
        )
    }else{
            return res.status(400).send({message:"Complete los datos"})
        }
}

function deteleTweet(req, res){
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');
    var tweetId = command[1];

    if(command[1]){
        Usuario.findOne({_id: userId, 'tweets._id': tweetId}, (err, tweetEncontrado)=>{
            if(tweetEncontrado){
                Usuario.findOneAndUpdate({_id: userId},{ $pull: {tweets:{_id: tweetId}}}, {new:true}, (err, tweetEliminado)=>{
                    if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
                    if(!tweetEliminado) return res.status(404).send({message: 'Error al eliminar el tweet'})
                    return res.status(200).send({message: "Tweet Eliminado con Exito!!!"})
                })
            }else{
                return res.status(200).send({message: 'El tweet no existe'});
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
    

    if(command[1] && command[2]){
        if(command.length>=4){
            for(let i=3; i<command.length;i++){
                newTweet = newTweet + " " + command[i]
            }
        }
        Usuario.findOneAndUpdate({_id: userId, 'tweets._id': tweetId},{'tweets.$.Descripcion': newTweet}, {new:true}, (err, tweetEditado)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion del tweet'})
            if(!tweetEditado) return res.status(404).send({message: 'Error al editar el tweet seleccionado'})
            return res.status(200).send({NuevoTweet: tweetEditado})
        })
    }else{
        return res.status(400).send({message:"Complete los datos"})
    }
}

function viewTweets(req, res){ 
    var userId = req.user.sub;
    var params = req.body.commands; 
    var command = params.split(' ');

    if(command[1]){
        Usuario.findOne({user: {$regex: command[1], $options: "i"}} , (err, tweetsEncontrado)=>{
            Usuario.findOne({_id: userId, 'following._id': tweetsEncontrado._id}, (err, userEncontrado)=>{
                   if(userEncontrado == null && tweetsEncontrado._id != userId){
                    return res.status(200).send({Message: "Debe de seguir a este usuario para poder ver sus Tweets"})  
                   }else{
                    if(err) return res.status(500).send({ message: 'error en la peticion de tweets' })
                    if(!tweetsEncontrado) return res.status(404).send({ message: 'no se han podido listar los tweets' })    
                    return res.status(200).send({Message: "Tweets de " + tweetsEncontrado.user, Tweets: tweetsEncontrado.tweets})  
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
    viewTweets
}

