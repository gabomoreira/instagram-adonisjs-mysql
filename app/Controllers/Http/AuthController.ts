import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";

export default class AuthController {
  public async signup({ request, response, session }: HttpContextContract) {
    const req = await request.validate({
      schema: schema.create({
        name: schema.string(),
        email: schema.string({}, [rules.email()]),
        username: schema.string({}),
        password: schema.string({}),
      }),
      messages: {
        "name.required": "Name is required to sign up",
        "email.required": "Email is required to sign up",
        "username.required": "Username is required to sign up",
        "password.required": "Password is required to sign up",
      },
    });

    const user = new User();
    user.name = req.name;
    user.email = req.email;
    user.username = req.username;
    user.password = req.password;
    await user.save();

    console.log(req);

    // send verification email
    user.sendVerificationEmail();

    return response.redirect("/profile");
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const req = await request.validate({
      schema: schema.create({
        email: schema.string({}, [rules.email()]),
        password: schema.string({}, [rules.minLength(8)]),
      }),
      messages: {
        "email.required": "Email is required to sign in",
        "password.required": "Password is required to sign in",
        "password.minLength": "Password must have minimum of 8 characters",
      },
    });

    try {
      await auth.attempt(req.email, req.password);
      return response.redirect("/profile");
    } catch (error) {
      return response.badRequest("Invalid Credentials");
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout();
    return response.redirect("/login");
  }
}
