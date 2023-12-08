import Session from '../../app/Models/Session'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Session.createMany([
      {
        name: 'Dreamscape Delights'
      },
      {
        name: 'Enchanted Portraits'
      },
      {
        name: 'Whimsical Wanderlust'
      },
      {
        name: 'Urban Chic'
      },
      {
        name: 'Mystical Moments'
      },
      {
        name: 'Vintage Vibes'
      },
      {
        name: 'Adventures in Wonderland'
      },
      {
        name: 'Ethereal Elegance'
      },
      {
        name: 'Magical Memories'
      },
      {
        name: 'Dreamscape Delights'
      }
    ])
  }
}
