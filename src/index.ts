require("dotenv").config()
import { ApolloServer } from "apollo-server-express"
import express from "express"
import session from "express-session"
import "reflect-metadata"
import { createConnection } from "typeorm"
import { schema } from "./graphql/schema"
import redis from "redis"
import connect from "connect-redis"
import { EmailController } from "./controllers/EmailController"

const startServer = async () => {
  /**
   * Define the Context Definitions passed in to Apollo Server by Express
   */
  interface Context {
    req: express.Request
    res: express.Response
  }

  /**
   * Initialize the Apollo GraphQL Server
   */
  const server = new ApolloServer({
    schema,
    onHealthCheck: async () => await createConnection(),
    context: ({ req, res }: Context) => ({
      req,
      res,
    }),
  } as any)

  /**
   * Create a connection with the database
   */
  await createConnection()

  /**
   * Initialize the Express Server
   */
  const app = express()

  /**
   * Add Session Handling to the Express Server
   * Handled by Redis
   */

  const client = redis.createClient({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!) || 6379,
  })
  const store = connect(session)

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      name: process.env.SESSION_COOKIE!,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
      store: new store({ client }),
    })
  )

  /**
   * Bind the Express Server to the Apollo GraphQL Server
   * Enable CORS
   */
  server.applyMiddleware({
    app,
    path: "/",
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  })

  /**
   * Bind the instantiated processes to the specified port; or default to 4000
   */
  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(
      `🚀  Server ready on port http://localhost:${process.env.PORT || 4000}${
        server.graphqlPath
      }`
    )
    console.log(
      `🚑  Try your health check at: http://localhost:${process.env.PORT ||
        4000}/.well-known/apollo/server-health`
    )
  })
}

startServer()
