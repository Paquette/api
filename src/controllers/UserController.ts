require("dotenv").config()
import { gql } from "apollo-server-core"
import bcrypt from "bcrypt"
import { IResolverObject } from "graphql-tools"
import { getConnection } from "typeorm"
import { Team } from "../database/entities/Team"
import { User } from "../database/entities/User"
import { BaseController, ICrudArguments } from "./BaseController"
import { EmailController } from "./EmailController"

export class UserController implements BaseController {
  email: EmailController

  constructor() {
    this.email = new EmailController()
  }

  /**
   * GraphQL Type Definitions
   */
  types = gql`
    type User {
      id: ID!
      firstName: String!
      lastName: String!
      email: String!
      username: String!
      # NEVER, EVER put the password field in here. Ever.
    }

    input UsernameAvailableInput {
      username: String!
    }
    input LoginUserInput {
      email: String!
      password: String!
    }
    # input LogoutUserInput {
    #   id: ID!
    # }
    input ShowUserInput {
      id: ID!
    }
    input StoreUserInput {
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    }
    input UpdateUserInput {
      firstName: String
      lastName: String
      username: String
    }

    extend type Query {
      me: User
      user(input: ShowUserInput): User
      usernameAvailable(input: UsernameAvailableInput): Boolean
      users: [User]
    }

    extend type Mutation {
      storeUser(input: StoreUserInput): User
      updateUser(input: UpdateUserInput): User
      loginUser(input: LoginUserInput): User
      logoutUser: Boolean
    }
  `

  queries: IResolverObject = {
    usernameAvailable: (source, args, context, info) =>
      this.usernameAvailable({ args }),
    me: (source, args, context, info) => this.me({ context }),
    user: (source, args, context, info) => this.show({ args }),
    users: (source, args, context, info) => this.index(),
  }
  mutations: IResolverObject = {
    storeUser: (source, args, context, info) => this.store({ args, context }),
    updateUser: (source, args, context, info) => this.update({ args, context }),
    loginUser: (source, args, context, info) => this.login({ args, context }),
    logoutUser: (source, args, context, info) => this.logout({ context }),
  }
  subscriptions: IResolverObject = {}

  resolvers = {
    Query: this.queries,
    Mutation: this.mutations,
    Subscription: this.subscriptions,
  }

  me = async ({ context }: ICrudArguments) => {
    const user = await User.findOne({
      where: { id: context.req.session.userId },
    })

    if (user) {
      return user
    } else {
      return null
    }
  }
  index = async (): Promise<User[]> => User.getRepository().find()
  store = async ({ args, context }: ICrudArguments): Promise<User> => {
    const {
      firstName,
      lastName,
      email,
      password: passwordPlainText,
    } = args.input

    const password = await bcrypt.hash(
      passwordPlainText,
      parseInt(process.env.BCRYPT_SALT_ROUNDS!)
    )

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    }).save()

    const team = await Team.create({
      name: `${firstName} ${lastName}'s Team`,
      type: "personal",
    }).save()

    await getConnection()
      .createQueryBuilder()
      .relation(User, "teams")
      .of(user)
      .add(team)

    const sentEmail = await this.email.send({
      subject: `Hey, ${user.firstName}! 👋🏼`,
      to: [email],
      html: ``,
      text: `Hello, just wanted to confirm that you registered a new Paquette account using this email (${email}). If this is a mistake, you can reply directly to me and I'll help you take care of whatever you need.`,
    })

    context.req.session.userId = user.id
    return user
  }
  login = async ({ args, context }: ICrudArguments): Promise<User | null> => {
    const { email, password: passwordPlainText } = args.input

    const user = await User.findOneOrFail({
      where: { email },
    })

    if (!user) {
      return null
    }

    const valid = await bcrypt.compare(passwordPlainText, user.password)

    if (!valid) {
      return null
    }

    context.req.session.userId = user.id
    return user
  }
  logout = async ({ context }: ICrudArguments): Promise<boolean> => {
    context.res.clearCookie(process.env.SESSION_COOKIE!)

    return true
  }
  show = async ({ args }: ICrudArguments) => {
    const { id } = args.input

    console.log(id)

    const user = await User.findOneOrFail({
      where: { id },
    })

    if (!user) {
      return null
    }

    return user
  }
  usernameAvailable = async ({ args }: ICrudArguments) => {
    const { username } = args.input

    const usernameCount = await User.count({
      where: { username },
    })

    const isAvailable = usernameCount === 0 ? true : false

    return isAvailable
  }
  update = async ({ args, context }: ICrudArguments) => {
    const { userId } = context.req.session

    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({
        ...args.input,
      })
      .where("id = :id", { id: userId })
      .execute()

    const user = await User.findOneOrFail({ where: { id: userId } })

    return user
  }
  delete = async () => {}
}
