export async function up(knex) {
  await knex.schema.createTable('location', table => {
    table.increments('Location_id').primary()
    table.string('Location_name', 45)
    table.string('Street_address', 45)
    table.string('City', 30)
    table.string('Zip', 5)
    table.string('Country', 30)
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('location')
}