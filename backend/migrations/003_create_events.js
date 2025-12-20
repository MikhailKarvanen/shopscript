export async function up(knex) {
  await knex.schema.createTable('event', table => {
    table.increments('Event_id').primary()
    table.string('Name', 45)
    table.string('Type', 15)

    table
      .integer('Location_Location_id')
      .unsigned()
      .notNullable()
      .references('Location_id')
      .inTable('location')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event')
}