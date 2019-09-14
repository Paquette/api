require("dotenv").config()
import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
  Transporter,
  SendMailOptions,
} from "nodemailer"

interface EmailSendOptions extends SendMailOptions {
  html: string
  subject: string
  text: string
  to: string[]
}

export class EmailController {
  transporter: Transporter

  constructor() {
    this.transporter = createTransport({
      host: process.env.GMAIL_SERVICE_HOST!,
      name: process.env.GMAIL_SERVICE_NAME!,
      port: parseInt(process.env.GMAIL_SERVICE_PORT!),
      secure: process.env.GMAIL_SERVICE_SECURE === "true" ? true : false,
      auth: {
        user: process.env.GMAIL_USER_NAME!,
        pass: process.env.GMAIL_USER_PASSWORD!,
      },
    })
  }

  send = async ({
    from = `"Austin Paquette" <austin@paquette.io>`,
    html,
    subject,
    text,
    to,
  }: EmailSendOptions) => {
    const sent = await this.transporter.sendMail({
      from,
      to: to.join(","),
      subject,
      text,
      html,
    })

    console.log("Message sent: %s", sent.messageId)
    // const testAccount = await createTestAccount()

    // create reusable transporter object using the default SMTP transport
    // const transporter = createTransport({
    //   host: "smtp.ethereal.email",
    //   port: 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: testAccount.user, // generated ethereal user
    //     pass: testAccount.pass, // generated ethereal password
    //   },
    // })

    // send mail with defined transport object
    // let info = await transporter.sendMail({
    //   from: '"Austin Paquette" <austin@paquette.io>', // sender address
    //   to: "austin@paquette.io", // list of receivers
    //   subject: "Hello ✔", // Subject line
    //   text: "Hello world?", // plain text body
    //   html: "<b>Hello world?</b>", // html body
    // })
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", getTestMessageUrl(info))
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
}
