require ('dotenv/config')
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: function ({ req }) {
      // allows token to be sent via  req.query or headers
      let token = req.headers.authorization?.trim().split(' ').pop();

      if (!token) {
        return {};
      }

      // verify token and get user data out of it
      try {
        const { data: user } = jwt.verify(token, process.env.AUTH_JWT_SECRET, { maxAge: expiration });
        return {user}
      } catch {
        console.log('Invalid token');
        return {};
      }
    },
  }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`)
    })
  })
}

startApolloServer();