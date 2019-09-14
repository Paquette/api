import { gql } from "apollo-server-core"
import { GraphQLResolveInfo } from "graphql"
import { IResolverObject, MergeInfo } from "graphql-tools"

export interface ICrudArguments {
  source?: any
  args?: any
  context?: any
  info?: GraphQLResolveInfo & {
    mergeInfo: MergeInfo
  }
}

export abstract class BaseController {
  /**
   * GraphQL Type Definitions
   */
  abstract types = gql``

  /**
   * Queries, Mutations, Subscriptions
   */
  abstract queries: IResolverObject = {}
  abstract mutations: IResolverObject = {}
  abstract subscriptions: IResolverObject = {}

  /**
   * Resolvers
   */
  abstract resolvers = {
    Query: {},
    Mutation: {},
    Subscription: {},
  }

  /**
   * CRUD Operations
   */
  abstract index = async ({
    source,
    args,
    context,
    info,
  }: ICrudArguments): Promise<any> => {}

  abstract store = async ({
    source,
    args,
    context,
    info,
  }: ICrudArguments): Promise<any> => {}

  abstract show = async ({
    source,
    args,
    context,
    info,
  }: ICrudArguments): Promise<any> => {}

  abstract update = async ({
    source,
    args,
    context,
    info,
  }: ICrudArguments): Promise<any> => {}

  abstract delete = async ({
    source,
    args,
    context,
    info,
  }: ICrudArguments): Promise<any> => {}
}
