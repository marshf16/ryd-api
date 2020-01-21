const express = require('express')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')
const joinMonster = require('join-monster')

const { Client } = require('pg')
const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "ryd-dev"
})
client.connect()

const port = 5000;

const Users = new graphql.GraphQLObjectType({
    name: 'Users',
    fields: () => ({
      id: { type: graphql.GraphQLString },
      firstName: { type: graphql.GraphQLString },
      lastName: { type: graphql.GraphQLString },
    })
  });
      
  Users._typeConfig = {
    sqlTable: 'users',
    uniqueKey: 'id',
  }

const QueryRoot = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        hello: {
            type: graphql.GraphQLString,
            resolve: () => "Hello world!"
        },
        users: {
            type: new graphql.GraphQLList(Users),
            resolve: (parent, args, context, resolveInfo) => {
              return joinMonster.default(resolveInfo, {}, sql => {
                return client.query(sql)
              })
            }
          },
    })
})

const schema = new graphql.GraphQLSchema({ query: QueryRoot });

const app = express();
app.use('/api', graphqlHTTP({
    schema: schema,
    //graphiql: true,
}));

app.listen(port, function () {
    console.log("Express server listening on port 5000");
});