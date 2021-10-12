'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const server = express();
server.use(cors());
server.use(express.json());

const PORT = process.env.PORT || 3010;

// Check if Listening
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})

// Mongo DB stuff
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let ModalWatch;

// Routes
server.get('/', homeHandler);
server.get('/getWatches', GetWatchesDataHandler);
server.post('/addToFav', AddToFavHandler);
server.get('/getFavWatch', GetFavWatchHandler)
server.delete('/deleteItem/:id/:email', DeleteItemHandler);
server.put('/updateWatches/:id', UpdateWatchesHandler);

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/WatchesAPI');

  const WatchSchema = new Schema({
    title: String,
    description: String,
    toUSD: String,
    image_url: String,
    email: String
  });
  ModalWatch = mongoose.model("Watches",WatchSchema);
}

// Functions Handlers
function homeHandler(req,res){
    res.send('Home Page');
};

function GetWatchesDataHandler(req,res){
    const url='https://watches-world.herokuapp.com/watches-list/';
    axios
    .get(url)
    .then(result => {
        res.send(result.data);
    })
    .catch(err => {
        console.log(err);
    });
};

function AddToFavHandler(req,res){
    const{title,description,toUSD,image_url,email}=req.body;
    ModalWatch.create({title,description,toUSD,image_url,email}, (err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            res.send(result);
        };
    });
};

function GetFavWatchHandler(req,res){
    const email = req.query.email;
    ModalWatch.find({email:email},(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.send(result);
        };
    });
};

function DeleteItemHandler(req,res){
    const id = req.params.id;
    const email = req.params.email;

    ModalWatch.deleteOne({_id:id},(err,result)=>{
        if(err){
            console.log(err);
        };
    });
    ModalWatch.find({email:email},(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            res.send(result);
        };
    });
};

function UpdateWatchesHandler(req,res){
    const id = req.params.id;

    const{ watchTitle, watchDescription, watchtoUSD, watchImage_URL,email }=req.body;
    ModalWatch.findByIdAndUpdate(id,{ title: watchTitle, description: watchDescription, toUSD: watchtoUSD, image_url:watchImage_URL }, (err,result)=>{
        ModalWatch.find({email:email},(err,result)=>{
            if(err){
                console.log(err);
            }
            else{
                res.send(result);

            }
        });
    });
};