export async function seed(knex) {
  await knex('event_date').del()

  await knex('event_date').insert([
    { Event_id: 1, Date: '2022-04-07' },
    { Event_id: 2, Date: '2022-06-04' },
    { Event_id: 3, Date: '2022-05-13' },
    { Event_id: 10, Date: '2023-04-06' },
    { Event_id: 11, Date: '2023-05-05' },
    { Event_id: 82, Date: '2025-12-11' }
  ])
}