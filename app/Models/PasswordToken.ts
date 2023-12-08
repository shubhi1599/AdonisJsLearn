import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Usersauth from './Usersauth'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class PasswordToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public usersauthsId: number

  @column()
  public type: string

  @column()
  public token: string

  @column.dateTime()
  public expiresAt: DateTime


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(()=> Usersauth, {
    foreignKey: 'usersauthsId', 
  })
  public usersauths: BelongsTo<typeof Usersauth>

  public static async generateResetPasswordTokens(user: Usersauth | null){
    const token = string.generateRandom(64)

    if(!user) return token

    const userInfo = await Usersauth.find(user); 

    console.log("++++", userInfo, "++++");

    if (!userInfo) {
      // Handle the case where the user with the provided ID is not found
      throw new Error('User not found');
    }

    await PasswordToken.expirepasswordResetTokens(userInfo)

    const now = DateTime.now();
    const expiresAt = now.plus({ hour: 1 }).toUTC() as DateTime;
    console.log("***********", expiresAt);
    const record = await userInfo.related('passwordResetTokens').create({
      type: 'PASSWORD_RESET',
      expiresAt: expiresAt ,
      token
    })

    return record.token
  }

  public static async expirepasswordResetTokens(user: Usersauth){
    try {
      await user.related('passwordResetTokens').query().update({
        expiresAt: DateTime.now().toUTC() as DateTime
      }) 
    } catch (error) {
      console.log("&&&&&", error)
    }
  }

  public static async getPasswordResetUser(token: string) {
    try {
      const time = DateTime.now().toSQL() ?? '';
      console.log("TIME", time, "TIME");
      // const record = await PasswordToken.query().preload('usersauths').where('token', token).where('expiresAt', '>', time).orderBy('createdAt','desc').first()
      const record = await PasswordToken.query().preload('usersauths').where('token', token).orderBy('createdAt','desc').first()
      console.log("RECORD", record, "RECORD");
      return record?.usersauths
    } catch (error) {
      console.error("Error querying database:", error);
    }
  }

  public static verify(token: string){
    const record = PasswordToken.query().where('expiresAt', '>', DateTime.now().toSQL() ?? '').where('token', token).first()

    return !!record
  }
}
