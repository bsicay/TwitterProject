'use strict'

var express = require("express")
var MainController = require("../controllers/mainController")
var md_auth = require("../middlewares/authenticated")


//RUTAS 
var api = express.Router()
api.post('/commands', md_auth.ensureAuth, MainController.commands)
module.exports = api; 
