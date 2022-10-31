import Env from "@ioc:Adonis/Core/Env";
import Route from "@ioc:Adonis/Core/Route";
import { DateTime } from "luxon";
import { BaseModel, beforeSave, column } from "@ioc:Adonis/Lucid/Orm";
import Hash from "@ioc:Adonis/Core/Hash";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public username: string;

  @column()
  public avatar: string;

  @column()
  public details: string;

  @column()
  public email: string;

  @column()
  public password: string;

  @column.dateTime({ autoCreate: false })
  public email_verified_at: DateTime;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  public async sendVerificationEmail() {
    const url =
      Env.get("APP_URL") +
      Route.makeSignedUrl(
        "verifyEmail",
        { email: this.email },
        {
          expiresIn: "30m",
        }
      );

    Mail.sendLater((message) => {
      message
        .from("verify@gabogram.com")
        .to(this.email)
        .subject("Please verify your email")
        .htmlView("emails/verify", { user: this, url });
    });
  }
}
