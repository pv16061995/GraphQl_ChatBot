const express= require('express');
const moment= require('moment');
const bodyParser= require('body-parser');
const { mongoose } = require('./db/db');
const { GraphQLServer, PubSub } = require('graphql-yoga');
const typeDefs = require('./src/schema');
const resolvers = require('./src/resolver');
var ObjectId = require('mongoose').Types.ObjectId;

const cors = require("cors");
const app = express();
app.use(bodyParser.json());
const DATETIMEFORMAT = "DDMMMYYYYhmmss";

const pubsub = new PubSub()
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } })

const queries = require('./src/db_queries');
app.use(cors());

var  group = require('./model/group');
var  message = require('./model/message');
const jwt = require("jsonwebtoken");
const JWTContant = {
  secret: "graphQl-ChatBot-Code",
  expireTimeInSec: 1800,
  algorithm: "HS512"
};

const paginate = require('express-paginate');


app.use("/tokenVerifyApi",(req,res)=>{
		
		 try {
           const token = req.headers.authorization;
          const payload = jwt.verify(token, JWTContant.secret)
		  if(!payload.email || !payload.password)
		  {
			res.send({"statusCode":400,"message":"Please enter valid token"})
		  }
           next();
         } catch (err) {
         res.send({"statusCode":400,"message":"Please enter valid token"})
      }
        
});

app.get('/group/:id',async(req,res)=>{
	if(!ObjectId.isValid(req.params.id))
	return res.send({"statuscode":400,"data":"No record found!!!"});

	group.findById(req.params.id,(err,docs)=>{
		if(!err)
		{
			response={"statuscode":200,"data":docs}
		}else{
			response={"statuscode":400,"data":err}
		}
		res.send(response);		
	});
});

app.get('/groupList',async(req,res,next)=>{

	try {

	 const token = req.headers.authorization;
      const payload = jwt.verify(token, JWTContant.secret)
	  if(!payload.email || !payload.password)
	  {
		res.send({"statusCode":400,"message":"Please enter valid token"})
	  }
 
    const [ results, itemCount ] = await Promise.all([
      group.find({}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).lean().exec(),
      group.count({})
    ]);
 
    const pageCount = Math.ceil(itemCount / req.query.limit);
 
    if (req.accepts('json')) {
      // inspired by Stripe's API response for list objects
      res.json({
        object: 'list',
        has_more: paginate.hasNextPages(req)(pageCount),
        data: results
      });
    } else {
      res.render('users', {
        users: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, parseInt(req.query.page))
      });
    }
 
  } catch (err) {
    next(err);
  }

	
	/*group.find((err,docs)=>{
		if(!err)
		{
			response={"statuscode":200,"data":docs}
		}else{
			response={"statuscode":400,"data":err}
		}
		res.send(response);		
	});*/
});

app.post('/addGroup',async(req,res)=>{
		let user_id = req.body.user_id;
		let group_name = req.body.group_name;
		let groupData = new group({group_name:group_name,user_ids:user_id});


	 await groupData.save((err,docs)=>{
		if(!err)
		{
			response={"statuscode":200,"data":docs}
		}else{
			response={"statuscode":400,"data":err}
		}
		res.send(response);		
	});
});

app.post('/addGroupMember',async(req,res)=>{

	if(!ObjectId.isValid(req.body.group_id))
	{
		return res.send({"statuscode":400,"data":"Please enter valid group id!!!"});
	}else{
		group.findById(req.body.group_id,async (err,docs)=>{
			if(!err)
			{
				let group_id = req.body.group_id;
				docs.user_ids.push(req.body.user_id);

				let res = await group.updateOne({_id:group_id}, {user_ids:docs.user_ids,last_updated:moment.utc().format(DATETIMEFORMAT)}, {
				  new: false,
				  upsert: true,
				  rawResult: true 
				},(err,docs)=>{
				if(!err)
				{
					response={"statuscode":200,"data":docs}
				}else{
					response={"statuscode":400,"data":err}
				}
			});
				
			}else{
				response={"statuscode":400,"data":err}
			}
			res.send(response);		
		});
	}

});

// User Auth Apis 

app.post('/login',async(req,res)=>{
	
	let email = req.body.email;
	let password = req.body.password;
	const tokenTimeStamp = "DD-MMM-YYYY, h:mm:ss A";


	let payload = {
		email,password,tokenTime:moment.utc().format(tokenTimeStamp)
	}

	const token = jwt.sign(payload, JWTContant.secret, {
            algorithm: JWTContant.algorithm,
            expiresIn: JWTContant.expireTimeInSec
          });

	if(!token)
	{
		response={"statuscode":400,"data":"Error occured while creating token."}
	}else{
		response={"statuscode":200,"data":token}
	}

	res.send(response);

});


/// Message Api //

const messageController = require("./controller/messageController")

app.get('/messagesByGroupId/:id',async(req,res)=>{

	test = await messageController.listMessageByGroupId(req.params.id);
	if(!test)
	{
		console.log("testerr",JSON.stringify(test));
		res.send(test);
	}else{
		console.log("test",test);
		res.send(test);
	}

	
});
/*app.get('/messagesByGroupId/:id',async(req,res)=>{
	if(!ObjectId.isValid(req.params.id))
	return res.send({"statuscode":400,"data":"No record found!!!"});

	message.find({group_id:req.params.id},(err,docs)=>{
		if(!err)
		{
			response={"statuscode":200,"data":docs}
		}else{
			response={"statuscode":400,"data":err}
		}
		res.send(response);		
	});
});*/

// app.post('/addMessage',async(req,res)=>{
// 		let from_user_id = req.body.from_user_id;
// 		let group_id = req.body.group_id;
// 		let msg = req.body.message;
// 		let messageData = new message({message:msg,from_user_id:from_user_id,group_id:group_id});

// 		// req1= {message:msg,groupId:group_id,from:from_user_id}

// 		// test = await messageController.addMessage(req1);
// 		// if(!test)
// 		// {
// 		// 	console.log("testerr",JSON.stringify(test));
// 		// 	res.send(test);
// 		// }else{
// 		// 	console.log("test",test);
// 		// 	res.send(test);
// 		// }



// 	 await messageData.save((err,docs)=>{
// 		if(!err)
// 		{
// 			response={"statuscode":200,"data":docs}
// 		}else{
// 			response={"statuscode":400,"data":err}
// 		}
// 		res.send(response);		
// 	});
// });





server.start(4000,() => console.log('GraphQl Server is running on localhost:4000'))
app.listen(3000,()=>console.log('Server started with port : 3000'));
