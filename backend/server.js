let express = require('express');
let app = express();

const cors = require('cors');
let mysql = require('mysql');
let url = require("url");


// Authentification
const authenticateToken = require("./middleware/auth");

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

const util = require('util');

// For the user authentication
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

// Tapahtumat tietyllä aikavälillä
app.get('/api/event', cors(), async function (req, res) {
    // let q = url.parse(req.url, true).query;
    // let startDate = q.from;
    // let endDate = q.to;
    // let type = q.type;

    let sql = "SELECT event.Event_id, event.Type, event.Name, location.Location_id, location.Location_name, location.Street_address, location.City, location.Zip, location.Country , event_date.Date " +
        " FROM `event`, `location`, `event_date` WHERE event.Event_id=event_date.Event_id AND event.Location_Location_id = location.Location_id "

        // WHERE event.Event_id=event_date.Event_id AND event.Location_Location_id =location.Location_id AND (event_date.Date BETWEEN " + startDate + " AND " + endDate + " )"

    let result;
    let db = makeDb();
    try {
        await makeTransaction(db, async () => {
            result = await db.query(sql);
        });
    } catch (err) {
        console.log(err);
    }
    res.send(result);
})

// Existing usernames
app.get('/api/usernames', cors(), async function (req, res) {

    let q = url.parse(req.url, true).query;
    let username = q.username;
    let email = q.email;

    let rowsFound = {
        username: false,
        email: false
    }

    let sqlCheckUsername = "SELECT COUNT(username) AS rows_found " +
        " FROM `user` WHERE username = ? "
    let sqlCheckEmail = "SELECT COUNT(email) AS rows_found" +
        " FROM `user` WHERE email = ? "

    try {
        // Check username
        if (q.username !== '') {
            let db = makeDb();
            await makeTransaction(db, async () => {
                await db.query(sqlCheckUsername, [q.username]).then((result) => rowsFound.username = result[0].rows_found > 0 ? true : false);
            });
        }
        // Check email
        if (q.email !== '') {
            let db = makeDb();
            await makeTransaction(db, async () => {
                await db.query(sqlCheckEmail, [q.email]).then((result) => rowsFound.email = result[0].rows_found > 0 ? true : false);
            });
        }
    } catch (err) {
        console.log(err);
    }

    res.send(rowsFound);
})

// Add new event
app.post('/api/newEvent', authenticateToken,  async (req, res) => {
    //console.log(req.body)



    //INSERT INTO location (Location_name, Street_address, City, Zip, Country) VALUES ('New Location', 'New address', 'City', 'Zip', 'Country')
    //INSERT INTO EVENT ( name, TYPE, Location_Location_id) VALUES ('Test event', 'Musiikki', 1)
    //INSERT INTO event_date (DATE, EVENT_ID) VALUES ('2023-05-05', 11)
    try {
        // const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const event = req.body
        //console.log(hashedPassword)

        // make updates to the database
        // if (user.email !== '') { // is  a username present?
            let sql1 = "INSERT INTO location (Location_name, Street_address, City, Zip, Country) VALUES ( ?, ?, ?, ?, ?)";
            let sql2 = "INSERT INTO EVENT (name, TYPE, Location_Location_id)"
                + " VALUES ( ?, ?, ?)";
            let sql3 = "INSERT INTO event_date (DATE, EVENT_ID)"
                + " VALUES ( ?, ?)";
            let db = makeDb();
            try {
                await makeTransaction(db, async () => {
                    let insertedEventId;
                    let insertedLocationId;
                    // IF NEW EVENT LOCATION PROVIDED
                    if(event.locationId === ''){
                        console.log("Statting transaction")
                        // INSERT NEW EVENT LOCATION
                        await db.query(sql1, [event.locationName, event.locationAddr, event.locationCity, event.locationZip, event.locationCountry]).then((result) => insertedLocationId = result.insertId);

                        console.log("Inserted location id " + insertedLocationId)
                        // INSERT NEW EVENT
                        await db.query(sql2, [event.name, event.type, insertedLocationId]).then((result) => insertedEventId = result.insertId);
                        console.log(insertedEventId)

                    }else{
                        // ELSE IF NO NEW EVENT LOCATION PROVIDED
                        // INSERT NEW EVENT
                        await db.query(sql2, [event.name, event.type, event.locationId]).then((result) => insertedEventId = result.insertId);

                        console.log(insertedEventId)

                    }


                    // INSERT NEW EVENT DATE
                    if(insertedEventId){
                        await db.query(sql3, [event.date, insertedEventId])
                        //result3.status(200).send("POST 3 succesful ");
                    }

                });
            } catch (err) {
                res.status(400).send("POST was not succesful ");
            }
        // }
    } catch (e) {
        res.json({message: "Error"});
    }
});


// User signup
app.post('/api/signup', urlencodedParser, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = req.body
        //console.log(hashedPassword)

        // make updates to the database
        if (user.email !== '') { // is  a username present?
            let sql = "INSERT INTO user (username, email, password)"
                + " VALUES ( ?, ?, ?)";
            let db = makeDb();
            try {
                await makeTransaction(db, async () => {
                    await db.query(sql, [user.username, user.email, hashedPassword]);

                   // res.status(200).send("POST successful ");
                    const accessToken = jwt.sign(
						{ id: user.id, email: user.email },
						process.env.JWT_SECRET,
						{ expiresIn: "2h" }
					);
                    //console.log(accessToken)

                    res.status(202).json({ accessToken: accessToken })
                });
            } catch (err) {
                res.status(400).send("POST was not successful ");
            }
        }
    } catch (e) {
        res.json({message: "Error"});
    }
});

// User login
app.post('/api/signin', urlencodedParser, async(req, res) => {
    let user = req.body
    console.log(user)
    try {
        // Try to obtain a given account password from the database to compare
        let dbUserPassword = ''
        let dbUserName = ''
        let sql = "SELECT username, email, password, COUNT(password) AS rows_found " +
            " FROM `user` WHERE email = ? "

        let db = makeDb()
        try {
            await makeTransaction(db, async () => {
                await db.query(sql, [user.email]).then((result) => {
                    // If user data found from the database
                    dbUserPassword = result[0].rows_found === 1 ? result[0].password : null
                    dbUserName = result[0].rows_found === 1 ? result[0].username : null
                });
            });
            //console.log(dbUserPassword)
        } catch (err) {
            console.log(err);
        }

        //Comparing the passswods
        if(dbUserPassword !== null){
            try{
                const match = await bcrypt.compare(user.password, dbUserPassword);
                const accessToken = jwt.sign(
					{ username: dbUserName, email: user.email },
					process.env.JWT_SECRET,
					{ expiresIn: "2h" }
				);
                if(match){
                    console.log("Passwords matched")
                    res.json({
                        accessToken: accessToken,
                        username: dbUserName,
                        message: "User Identified"});
                } else {
                    res.json({
                        accessToken: null,
                        message: "Invalid Credentials" });
                }
            } catch(e) {
                console.log(e)
            }
        } else {
            res.json({
                accessToken: null,
                message: "Invalid Credentials" });
        }
    }catch(e){
        res.json({
            accessToken: null,
            message: "Error"})
    }

})

// Yksittäisen ajoneuvon tiedot id:lla
// app.get('/api/car/:id', cors(), async function (req, res, url) {
//     let sql = "SELECT vehicle.Vehicle_id, vehicle_type.Type_name, Vehicle_model, Reg_number, Price, Vehicle_descr, Vehicle_src FROM vehicle, vehicle_type WHERE vehicle.Vehicle_id = '" + req.params.id + "' AND vehicle.Vehicle_type = vehicle_type.Type_id GROUP BY Vehicle_type ";
//     let db = makeDb();
//     let result;
//     try {
//         await makeTransaction(db, async () => {
//             result = await db.query(sql);
//         });
//     } catch (err) {
//         console.log(err);
//     }
//     res.send(result);
// });

// Ajoneuvon tyyppin nimi id:llä
// app.get('/api/vehicle_type/:id', cors(), async function (req, res, url) {
//     let sql = "SELECT Type_id, Type_name FROM vehicle_type WHERE Type_id = '" + req.params.id + "' GROUP BY Type_id ";
//     let db = makeDb();
//     let result;
//     try {
//         await makeTransaction(db, async () => {
//             result = await db.query(sql);
//         });
//     } catch (err) {
//         console.log(err);
//     }
//     res.send(result);
// });

// Ajoneuvon tyypit
// app.get('/api/vehicle_type', cors(), async function (req, res) {
//     let sql = "SELECT vehicle_type.Type_id, Type_name FROM vehicle_type WHERE 1=1 ORDER BY Type_id";
//     let db = makeDb();
//     let result;
//     try {
//         await makeTransaction(db, async () => {
//             result = await db.query(sql);
//         });
//     } catch (err) {
//         console.log(err);
//     }
//
//     res.send(result);
// });

// Tilauksen tekeminen
// app.post('/api/orders/', async function (req, res, url) {
//     let json = JSON.stringify(req.body);
//     let jsonLength = Object.keys(json).length;
//
//     let sql = "INSERT INTO `order` (Personal_id, First_name, Last_name, Email, Phone_Number, Home_address," +
//         "City,Postal_code,Additional_info,Payment,Vehicle_id, Date_create, Order_start, Order_end, Amount)" +
//         "SELECT *" +
//         " FROM JSON_TABLE ('" + json + "', '$' COLUMNS ( " +
//         "Personal_id         VARCHAR(11)     PATH '$[0].Personal_id', " +
//         "First_name          VARCHAR(45)     PATH '$[0].First_name', " +
//         "Last_name           VARCHAR(45)     PATH '$[0].Last_name', " +
//         "Email               VARCHAR(45)     PATH '$[0].Email', " +
//         "Phone_Number        VARCHAR(13)     PATH '$[0].Phone_Number', " +
//         "Home_address        VARCHAR(50)     PATH '$[0].Home_address', " +
//         "City                VARCHAR(50)     PATH '$[0].City', " +
//         "Postal_code         int(5)          PATH '$[0].Postal_code', " +
//         "Additional_info	 TEXT 		     PATH '$[0].Additional_info', " +
//         "Payment             VARCHAR(50)     PATH '$[0].Payment', " +
//         "Vehicle_id          INT(11)         PATH '$[0].Vehicle_id'," +
//         "Date_create         datetime        PATH '$[0].Date_create', " +
//         "Order_start         datetime        PATH '$[0].Order_start', " +
//         "Order_end           datetime        PATH '$[0].Order_end', " +
//         "Amount              decimal(10,2)   PATH '$[0].Amount')) AS `order`;"
//
//     let db = makeDb();
//     let result;
//     try {
//         await makeTransaction(db, async () => {
//             result = await db.query(sql);
//         });
//     } catch (err) {
//         console.log(err);
//     }
//
//     res.send(result);
//
// })

const PORT = process.env.PORT || 5000;

let server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

// Method for interacting with database


function makeDb() {

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

    return {
        query(sql, args) {
            return util.promisify(connection.query)
                .call(connection, sql, args);
        },
        close() {
            return util.promisify(connection.end).call(connection);
        },
        beginTransaction() {
            return util.promisify(connection.beginTransaction)
                .call(connection);
        },
        commit() {
            return util.promisify(connection.commit)
                .call(connection);
        },
        rollback() {
            return util.promisify(connection.rollback)
                .call(connection);
        }
    };
}

// Method making transaction
async function makeTransaction(db, callback) {
    try {
        await db.beginTransaction();
        await callback();
        await db.commit();
    } catch (err) {
        await db.rollback();
        throw err;
    } finally {
        await db.close();
    }
}