export async function seed(knex) {
  await knex('users').del()

  await knex('users').insert([
    {
      username: 'romanpr',
      email: 'romanpr@metropolia.fi',
      password: '$2b$10$YLYullk0vuUmPkh8YsphP.4bwqPEDr8.FT/AhtV/14lYXQBbH5wi.',
      create_time: '2023-02-12 19:07:09'
    },
    {
      username: 'mihailka',
      email: 'mihailka@metropolia.fi',
      password: '$2b$10$JufzLEWIB9.1FSp4dYkuue2ROBMb36gN/x6sBlJk2zGFvRgagiu62',
      create_time: '2023-02-15 20:06:35'
    },
    {
      username: 'Mihail',
      email: 'karvanen@gmail.com',
      password: '$2b$10$vaURwuPJhGxB0NfL6aEUq.9teGFLORljWlcKnIjgUZQ0O7YXpZlTq',
      create_time: '2025-03-30 16:55:34'
    },
    {
      username: 'megabyte',
      email: 'megabyte@gmail.com',
      password: '$2b$10$TQ43942MZ3eX6d.3uNDVTOkLyswoXz2wJt9Tfrgsk.eIm45J556ym',
      create_time: '2025-03-30 20:18:22'
    }
  ])
}