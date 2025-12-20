export async function seed(knex) {
  await knex('event').del()

  await knex('event').insert([
    { Event_id: 1, Name: 'Maustetytöt', Type: 'Musiikki', Location_Location_id: 1 },
    { Event_id: 2, Name: 'Minttu sekä Ville', Type: 'Musiikki', Location_Location_id: 2 },
    { Event_id: 3, Name: '2022 Jääkiekon MM-kisat', Type: 'Urheilu', Location_Location_id: 3 },
    { Event_id: 10, Name: 'The Count Basie Orchestra', Type: 'Musiikki', Location_Location_id: 6 },
    { Event_id: 11, Name: 'Test event', Type: 'Musiikki', Location_Location_id: 1 },
    { Event_id: 82, Name: 'New EVENT 2025 !!!!', Type: 'Musiikki', Location_Location_id: 1 }
  ])
}