import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'usersauth_sessions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('usersauth_id').unsigned().references('id').inTable('usersauths')
      table.integer('session_id').unsigned().references('id').inTable('sessions')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      // table.timestamp('created_at', { useTz: true })
      // table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
