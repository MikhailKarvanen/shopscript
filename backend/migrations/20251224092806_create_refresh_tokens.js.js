/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('refresh_tokens', table => {
    table.increments('id').primary()
    table.integer('user_id').unsigned().notNullable()
    table.string('token', 512).notNullable()
    table.timestamp('expires_at').notNullable()
    table.timestamps(true, true)

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('refresh_tokens')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
