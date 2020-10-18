const express= require('express');
const moment= require('moment');
const bodyParser= require('body-parser');
const { mongoose } = require('../db/db');
var  message = require('../model/message');
var ObjectId = require('mongoose').Types.ObjectId;


const addMessage = async(req)=>{
		let from_user_id = req.from;
		let group_id = req.groupId;
		let msg = req.message;
		let messageData = new message({message:msg,from_user_id:from_user_id,group_id:group_id});
		response = [];

	return await messageData.save((err,docs)=>{
		if(!err)
		{
			response=docs;
			console.log("controller",docs)
		}else{
			console.log("controller err",err)
			response=[];
		}
		return response;		
	});
}

const listMessageByGroupId = async(group_id,res)=>{
	if(!ObjectId.isValid(group_id))
	return [];

	return await message.find({group_id:group_id},(err,docs)=>{
		if(!err)
		{
			response=docs;
			
		}else{
			response=[];
		}
		console.log("controller",response);
		return response;		
	});
}

module.exports = {addMessage,listMessageByGroupId}