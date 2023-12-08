import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Usersauth from 'App/Models/Usersauth'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Usersauth.createMany([
      {
        email: 'virk@gmail.com',
        password: 'secret',
      },
      {
        email: 'romain@gmail.com',
        password: 'supersecret'
      }
    ])
  }
}
