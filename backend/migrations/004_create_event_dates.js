exports.up = async function (knex) {
  await knex.schema.createTable('event_date', table => {
    table.date('Date').notNullable()
    table.integer('Event_id').unsigned().notNullable().primary()

    table
      .foreign('Event_id')
      .references('Event_id')
      .inTable('event')
      .onUpdate('CASCADE')
      .onDelete('NO ACTION')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('event_date')
}