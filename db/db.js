const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/graphql_chatbot', { useNewUrlParser: true, useUnifiedTopology: true },(err)=>{
	if(!err)
		console.log('Connect with db successfully.');
});


module.exports=mongoose;