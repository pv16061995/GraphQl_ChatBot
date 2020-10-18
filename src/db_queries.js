var { group }= require('../model/group');

const groupById = async ()=>{

	let response = await group.find();

	return response;

}

module.exports = {groupById}