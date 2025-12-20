export async function seed(knex) {
  await knex('location').del()

  await knex('location').insert([
    {
      Location_id: 1,
      Location_name: 'Tavastia',
      Street_address: 'Urho Kekkosen katu',
      City: 'Helsinki',
      Zip: '00100',
      Country: 'Finland'
    },
    {
      Location_id: 2,
      Location_name: 'Kultturitehdäs Korjaamo',
      Street_address: 'Töölönkatu 51 a-b',
      City: 'Helsinki',
      Zip: '00250',
      Country: 'Finland'
    },
    {
      Location_id: 3,
      Location_name: 'Helsingin jäähalli',
      Street_address: 'Nordensklödinkatu 11-13',
      City: 'Helsinki',
      Zip: '00250',
      Country: 'Finland'
    },
    {
      Location_id: 6,
      Location_name: 'Suomen Kansallisooppera',
      Street_address: 'Helsinginkatu 58',
      City: 'Helsinki',
      Zip: '00250',
      Country: 'Finland'
    }
  ])
}