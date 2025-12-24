exports.up = async function (knex) {
  await knex.schema.createTable('event', table => {
    table.increments('Event_id').primary()
    table.string('Name', 45)
    table.string('Type', 15)
    table.integer('Location_Location_id').unsigned().notNullable()

    table
      .foreign('Location_Location_id')
      .references('Location_id')
      .inTable('location')
      .onUpdate('NO ACTION')
      .onDelete('NO ACTION')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('event')
}