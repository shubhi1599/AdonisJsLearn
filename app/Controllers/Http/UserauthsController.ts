import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usersauth from "App/Models/Usersauth";
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import Mail from '@ioc:Adonis/Addons/Mail';
import Env from '@ioc:Adonis/Core/Env'
import PasswordToken from 'App/Models/PasswordToken';
import View from '@ioc:Adonis/Core/View';
import Database from '@ioc:Adonis/Lucid/Database';
import session from 'Config/session';

export default class UserauthsController {
    public async register({ request, response }) {

        const newPostSchema = schema.create({
            email: schema.string(),
            password: schema.string()
        })

        const payload = await request.validate({ schema: newPostSchema });

        const user = await Usersauth.create({
            ...payload
        });

        console.log(user.$isPersisted);
        response.send({ message: 'User registered' })

        return user;
    }

    public async login({ auth, request, response }) {

        const email = request.input('email')
        const password = request.input('password')

        try {
            const token = await auth.use('api').attempt(email, password)
            return token
        } catch {
            return response.unauthorized('Invalid credentials')
        }
    }

    /** Forgot and reset password API's */

    public async forgot() {
        return View.render('password.forgot')
    }

    public async send({ request, response, session }: HttpContextContract) {

        const emailSchema = schema.create({
            email: schema.string()
        })

        const email = await request.validate({ schema: emailSchema });
        const user = await Usersauth.findBy('email', email.email);

        console.log("+++++++++++++++++++++++++++++++++", user);

        const token = await PasswordToken.generateResetPasswordTokens(user?.$attributes.id);


        if (user) {
            await Mail.send((message) => {
                message
                    .from('noreply@adocast.com')
                    .to(user.email)
                    .subject('Reset Password Code')
                    .html(`reset your password by<a href="${Env.get('DOMAIN')}/${'resetLink'}">   clicking </a>,   use token ${token}`)
            })
        } else {
            return "no user"
        }
        // session.flash('success', 'If email is correct then you will get the reset password link shortly')
        return response.send({ message: 'Mail send' })
    }

    public async resetpassword({ params, request, response }: HttpContextContract) {
        // const token = params.token

        const token = request.input('token')

        const isValid = await PasswordToken.verify(token)

        if (isValid) {
            const passwordSchema = schema.create({
                password: schema.string()
            });

            const { password } = await request.validate({ schema: passwordSchema });

            console.log("TOKEN", token, "TOKEN");

            const user = await PasswordToken.getPasswordResetUser(token);

            console.log("^^^^^^^^^^^^^^", user?.$attributes.id, "^^^^^^^^^^^^^^^");

            if (!user) {
                return response.send({ message: "Token expired, associated user could not be found!" });
            } else {

                const userInstance = await Usersauth.findBy('id', user?.$attributes.id);
                if (userInstance) {
                    userInstance.merge({ password });
                    await userInstance.save();
                    return response.send({ Message: "password changes" })
                } else {
                    return response.send({ message: "User not found!" });
                }
            }
            // return response.send({message: "Enter the password"})
        } else {
            return "Tokens are invalid"
        }
    }

    // public async storeResetpass({request, response}){
    //     const passwordSchema = schema.create({
    //         token: schema.string(),
    //         password: schema.string()
    //     });

    //     const {token, password} = await request.validate({schema: passwordSchema});

    //     console.log("TOKEN",token, "TOKEN");

    //     const user = await PasswordToken.getPasswordResetUser(token);

    //     console.log("^^^^^^^^^^^^^^", user?.$attributes.id, "^^^^^^^^^^^^^^^");

    //     if(!user){
    //         return response.send({message: "Token expired, associated user could not be found!"});
    //     }else{

    //         const userInstance = await Usersauth.findBy('id', user?.$attributes.id);
    //         if (userInstance) {
    //             userInstance.merge({ password });
    //             await userInstance.save();
    //             return response.send({ Message: "password changes"})
    //         } else {
    //             return response.send({ message: "User not found!" });
    //         }
    //     }
    // }

    /** Google authentication API's */

    public async googlelogin({ ally }) {
        return ally.use('google',).redirect()
    }

    public async redirectafterlogin({ ally, response }) {

        const google = ally.use('google').stateless();

        if (google.accessDenied()) {
            return 'Access was denied'
        }

        if (google.stateMisMatch()) {
            return 'Request expired. Retry again'
        }

        if (google.hasError()) {
            return google.getError()
        }


        const googleUser = await google.user();

        console.log("google", googleUser);
        console.log("Email", googleUser.email, "Email")
        const userEmail = googleUser.email
        const providerId = googleUser.id

        /** Used raw queries just to know how it works in adonisJs */

        const existingUser = await Database.rawQuery(
            'SELECT * FROM usersauths WHERE email = ?',
            [userEmail]
        );
        console.log("HHEELLOO", existingUser);

        if (existingUser[0].length > 0) {
            return response.send({ message: 'User already exists' });
        } else {
            const insertUser = await Database.rawQuery(
                'INSERT INTO usersauths (auth_provider_id, email, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
                [providerId, userEmail]
            );

            response.send({ message: 'User inserted successfully', user: insertUser });
        }

        //   response.send({googleUser});
    }

    /** To keep many to many relationship between user and session we have pivot migration
     *  which makes a seperate table to keep track between user and session relation
     */

    /** Example for many to many relation */
    public async assignSession({ request, response }) {

        const { email } = request.body('email');
        const { sessions } = request.body('sessions');

        console.log(email);
        console.log(sessions);

        if (sessions && sessions.length > 0) {
            const user = await Usersauth.findByOrFail('email', email);

            if (user) {
                await user.related('sessions').attach(sessions);

                return response.status(200).json({ message: 'Sessions assigned successfully' });
            } else {
                return response.status(200).json({ message: 'No User found!' });
            }
        }
        return response.status(400).json({ message: 'No sessions provided' });

    }
}
