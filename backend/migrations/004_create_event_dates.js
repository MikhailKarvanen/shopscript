export async function up(knex) {
  await knex.schema.createTable('event_date', table => {
    table.date('Date').notNullable()

    table
      .integer('Event_id')
      .unsigned()
      .primary()
      .references('Event_id')
      .inTable('event')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event_date')
}