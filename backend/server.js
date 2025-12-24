const express = require('express');
const app = express();

// Db
const knex = require('./db/knex')

const cors = require('cors');
let url = require("url");


// Authentification
const { generateAccessToken, generateRefreshToken, authenticateToken } = require('./middleware/auth');

// For file uploads
const multer = require('multer')


const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads/images/events");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, uploadDir);
	},
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix+file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only PNG and JPEG is allowed!'), false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter
})


app.post('/api/file-upload', upload.single('file'), (req, res) => {
    try {
        res.status(200).json({ success: "file upload successful" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})



// For the user authentication

const secrets = require ('./config/secrets.js')
require('dotenv').config()


//console.log(process.env) // remove this after you've confirmed it is working


let bodyParser = require('body-parser');



// node native promisify

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Bearer  ");
    next();
});

let urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// --- Get all events with date and location --- 
app.get('/api/events', async (req, res) => {
  try {
    const events = await knex('event as e')
      .join('event_date as d', 'd.Event_id', 'e.Event_id')
      .join('location as l', 'l.Location_id', 'e.Location_Location_id')
      .select(
        'e.Event_id as Event_id',
        'e.Name as Name',
        'e.Type as Type',
        'd.Date as Date',
        'l.Location_id as Location_id',
        'l.Location_name as Location_name',
        'l.Street_address as Street_address',
        'l.Zip as Zip',
        'l.City as City',
        'l.Country as Country'
      )
      .orderBy('d.Date', 'asc')

    res.json(events)
    
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to fetch events'
    })
  }
})

// --- Get a single event by its ID ---
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Fetch event with location and date
    const event = await knex('event as e')
      .join('event_date as d', 'd.Event_id', 'e.Event_id')
      .join('location as l', 'l.Location_id', 'e.Location_Location_id')
      .select(
        'e.Event_id as id',
        'e.Name as name',
        'e.Type as type',
        'd.Date as date',
        'l.Location_id as locationId',
        'l.Location_name as locationName',
        'l.City as city',
        'l.Country as country'
      )
      .where('e.Event_id', id)
      .first() // возвращает один объект или undefined

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch event' })
  }
})

// --- Check if username or email already exists ---
app.get('/api/usernames', async (req, res) => {
  const { username = '', email = '' } = req.query

  try {
    const result = {}

    if (username) {
      const exists = await knex('user')
        .where({ username })
        .first()
      result.username = !!exists
    }

    if (email) {
      const exists = await knex('user')
        .where({ email })
        .first()
      result.email = !!exists
    }

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to check usernames/emails' })
  }
})

// --- Create a new event ---
app.post('/api/newEvent', authenticateToken, async (req, res) => {
  const event = req.body

  /**
   * Validate request payload BEFORE starting transaction
   */
  if (!event.name || !event.type || !event.date) {
    return res.status(400).json({
      message: 'Missing required fields: name, type or date'
    })
  }

  try {
    // Start database transaction
    await knex.transaction(async trx => {
      let locationId = event.locationId

      /**
       * Create location if locationId is not provided
       */
      if (!locationId || locationId === '') {
        const [newLocationId] = await trx('location').insert({
          Location_name: event.locationName,
          Street_address: event.locationAddr,
          City: event.locationCity,
          Zip: event.locationZip,
          Country: event.locationCountry
        })

        locationId = newLocationId
      }

      /**
       * Create event
       */
      const [eventId] = await trx('event').insert({
        Name: event.name,
        Type: event.type,
        Location_Location_id: locationId
      })

      /**
       * Create event date
       */
      await trx('event_date').insert({
        Event_id: eventId,
        Date: event.date
      })
    })

    res.status(201).json({ message: 'Event created successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create event' })
  }
})


const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// --- User signup --- 
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const [newUserId] = await knex('users').insert({
      username,
      email,
      password: hashedPassword,
      create_time: knex.fn.now()
    })


    // Fetch the user we just inserted
    const newUser = await knex('user').where({ user_id: newUserId }).first();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await knex('users').where({ user_id: newUserId }).update({ refresh_token: refreshToken });

    res.status(201).json({ accessToken, refreshToken, username: newUser.username });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to register user' })
  }
})

// --- User login ---
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body
  

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' })
  }

  try {
    const dbUser = await knex('users').where({ email }).first()

    if (!dbUser) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, dbUser.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const accessToken = generateAccessToken(dbUser);
    const refreshToken = generateRefreshToken(dbUser);

      await knex('users').where({ id: dbUser.id }).update({ refresh_token: refreshToken });

  res.json({ accessToken, refreshToken, username: dbUser.username });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to login' })
  }
})

// --- Refresh access token endpoint ---
app.post('/api/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  const jwt = require('jsonwebtoken');

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const dbUser = await knex('users')
      .where({ user_id: payload.userId, refresh_token: refreshToken })
      .first();

    if (!dbUser) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken(dbUser);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// --- User logout endpoint. Deletes refresh token ---
app.post('/api/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'No refresh token provided' });

  await knex('users').where({ refresh_token: refreshToken }).update({ refresh_token: null });
  res.json({ message: 'Logged out successfully' });
});


const PORT = process.env.PORT || 5000;

let server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});


// --- DB TEST ROUTE ---
app.get('/api/health/db', async (req, res) => {
  try {
    await knex.raw('SELECT 1')
    res.json({ db: 'ok' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ db: 'error' })
  }
})