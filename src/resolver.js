const messageController = require("../controller/messageController");
const _ = require("lodash");

const chats = []

const resolvers = {
  Query: {
    async chats (root, {groupId}, context) {
      let chatData = [];
      let chatDataFromDb = await messageController.listMessageByGroupId(groupId);
      _.forEach(chatDataFromDb, (value)=>{
          let chatObj= {};
        _.set(chatObj,'id',value._id);
        _.set(chatObj,'message',value.message);
        _.set(chatObj,'from',value.from_user_id);

        chatData.push(chatObj);
        
      });
      
      return chatData;
    }
  },

  Mutation: {
    async sendMessage (root, { from, message, groupId }, { pubsub }) {
      const chat = { id: chats.length + 1, from, message,groupId }

      await messageController.addMessage(chat);
     
      pubsub.publish( groupId, { messageSent: chat })

      return chat
    }
  },

  Subscription: {
    messageSent: {
      subscribe: (root, {groupId}, { pubsub }) => {
        return pubsub.asyncIterator(groupId)
      }
    }
  }
}

module.exports = resolvers