const typeDefs = `
      type Chat {
        id: String!
        from: String!
        message: String!
      }

      type Query {
        chats(groupId:String!): [Chat]

      }

      type Mutation {
        sendMessage(from: String!, message: String!,groupId:String!): Chat
      }

      type Subscription {
        messageSent(groupId:String!): Chat
      }
    `
    module.exports = typeDefs