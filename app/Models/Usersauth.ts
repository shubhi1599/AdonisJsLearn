import { DateTime, StringUnitLength } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import PasswordToken from './PasswordToken'
import Session from './Session'

export default class Usersauth extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  // @column()
  // public rememberMeToken: string | null

  @column()
  public authProviderId: String | null

  @hasMany(() => PasswordToken)
  public token: HasMany<typeof PasswordToken>

  @hasMany(() => PasswordToken, {
    foreignKey: 'usersauthsId', 
    onQuery: query => query.where('type', 'PASSWORD_RESET')
  })
  public passwordResetTokens: HasMany<typeof PasswordToken>

  @manyToMany(() => Session,{
    pivotTable: 'usersauth_sessions'
  })
  public sessions: ManyToMany<typeof Session> 

  // @column.dateTime()
  // public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (usersauth: Usersauth) {
    if (usersauth.$dirty.password) {
      usersauth.password = await Hash.make(usersauth.password)
    }
  }
}
