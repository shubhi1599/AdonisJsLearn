import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Usersauth from './Usersauth'

export default class Session extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @manyToMany(() => Usersauth,{
    pivotTable: 'usersauth_sessions'
  })
  public sessions: ManyToMany<typeof Usersauth> 

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
