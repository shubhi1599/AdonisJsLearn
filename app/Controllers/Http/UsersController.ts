// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'
import User from 'App/Models/User';

/** This file is just for CRUD in adonisJs. */
export default class UsersController {
    public async index({request, response}){

        const newPostSchema = schema.create({
            firstname: schema.string(),
            lastname: schema.string(),
            phone:schema.string(),
            email: schema.string(),
            password: schema.string()
          })
        
          const payload = await request.validate({ schema: newPostSchema });

          console.log(payload)

          if(payload){
            const user = await User.create({
                ...payload
              });

              console.log(user.$isPersisted);
              response.send({ message: 'User created' })
          }

          return payload;
    }

    public async change({request, response}){

        const id = request.param('id');
        const body = request.body('firstname','lastname','phone','pssword');

        const user = await User.query().where('id', id).update({ ...body });        

        console.log(body);
        console.log(id);

        console.log(user);

        response.send({message: "USER UPDATED"})
        
    }

    public async get({request, response}){

        const id = request.param('id');
        const user = await User.find(id);

        response.send({user: user})
    }

    public async remove({request, response}){

        const id = request.param('id');

        const user = await User.findOrFail(id);
        console.log(user);
        await user.delete();

        response.send({message: "User deleted!"})
    }

    public async provideImage({request, response}){
        const coverImage = request.file('cover_image',{
            size: '2mb',
            extnames: ['jpg', 'png', 'gif'],
          })
          
          if (!coverImage) {
            return "No Image provided"
          }
          
          if (!coverImage.isValid) {
            return coverImage.errors
          }
          

        if (coverImage) {
          await coverImage.move(Application.tmpPath('uploads'));
          response.send({message: "Image Uploaded"})
        }
    }

}
