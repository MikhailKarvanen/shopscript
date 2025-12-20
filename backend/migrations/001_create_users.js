export async function up(knex) {
  await knex.schema.createTable('users', table => {
    table.string('username', 16)
    table.string('email', 255).notNullable().primary()
    table.string('password', 384).notNullable()
    table.timestamp('create_time').defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users')
}