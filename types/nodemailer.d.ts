declare module "nodemailer" {
  export function createTransport(options: any): {
    sendMail(options: {
      to: string;
      from: string | undefined;
      subject: string;
      html?: string;
      text?: string;
    }): Promise<any>;
  };
}
