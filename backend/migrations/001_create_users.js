exports.up = async function (knex) {
  await knex.schema.createTable('users', table => {
    table.increments('id').primary()
    table.string('username', 16)
    table.string('email', 255).notNullable()
    table.string('password', 384).notNullable()
    table.timestamp('create_time').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user')
}