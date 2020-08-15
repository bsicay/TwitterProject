'use strict'

var Usuario = require('../models/user')
var user = require("../controllers/userController");
var tweet = require("../controllers/tweetsController");


function commands(req, res){
    var params = req.body.commands; 
    var position = params.split(' ');
    switch(position[0].toLowerCase()){
        case 'register': 
            user.addUser(req, res);
        break;
        case 'login':
            user.login(req, res);
        break;
        case 'add_tweet':
            tweet.addTweet(req, res);
        break;
        case 'delete_tweet':
            tweet.deteleTweet(req, res);
        break;
        case 'edit_tweet': 
            tweet.editTweet(req, res);
        break;
        case 'view_tweets':
            tweet.viewTweets(req, res);
        break;
        case 'profile':
            user.profile(req, res);
        break;
        case 'follow':
            user.follow(req, res);
        break;
        case 'unfollow':
            user.unfollow(req, res);
        break;
        case 'like_tweet':
            tweet.likeTweet(req, res);
        break;
        case 'dislike_tweet':
            tweet.dislikeTweet(req, res);
        break;
        case 'reply_tweet':
            tweet.replyTweet(req, res);
        break;
        default:
            return res.status(200).send({message:"COMANDO NO VALIDO!!!"})   
    }
}

module.exports = {
    commands
}




        
