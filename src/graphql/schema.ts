import { gql } from "apollo-server-core"
import { makeExecutableSchema } from "graphql-tools"
import { merge } from "lodash"
import { UserController } from "../controllers/UserController"

/**
 * Destructure the required schema information from the Controllers
 */
const { types: UserTypes, resolvers: UserResolvers } = new UserController()

/**
 * Scaffold our Type Definition
 */
const TypeDefs = gql`
  type Query {
    # Required since we cannot have this truly empty
    _empty: String
  }
  type Mutation {
    # Required since we cannot have this truly empty
    _empty: String
  }
  type Subscription {
    # Required since we cannot have this truly empty
    _empty: String
  }
`

/**
 * Scaffold our Resolvers
 */
const resolvers = {
  Query: {},
  Mutation: {},
  Subscription: {},
}

/**
 * Bring it all together
 */
export const schema = makeExecutableSchema({
  typeDefs: [TypeDefs, UserTypes],
  resolvers: merge(resolvers, UserResolvers),
})
