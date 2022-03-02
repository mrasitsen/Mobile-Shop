

const express = require("express");
const morgan = require("morgan")
const sqlite = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();


app.use(morgan("dev"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//creating the database with dummy data
function my_database(filename) {

    var db = new sqlite.Database(filename, (err) => {
        if (err) {
            console.error("Hello world" + err.message);
        }
        console.log('Connected to the phones database.');
    });

    db.serialize(() => {
        db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
            image 	CHAR(254) NOT NULL,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
        db.all(`select count(*) as count from phones`, function (err, result) {
            if (result[0].count < 2) {

                let sql = `INSERT INTO phones (image, brand, model, os, screensize) VALUES (?, ?, ?, ?, ?)`;

                let data = [
                    [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg",
                        "Fairphone",
                        "FP3",
                        "Android",
                        "7"
                    ],
                    [
                        "https://tinyurl.com/a7tkkhzt",
                        "iphone",
                        "iphone 8",
                        "ios",
                        "5"
                    ]
                ]

                for (let i of data) {
                    db.run(sql, i);
                }
                console.log('Inserted dummy phone entry into empty database');
            } else {
                console.log("Database already contains", result[0].count, " item(s) at startup.");
            }
        });
    });
    return db;
}

// making the database connection
let db = my_database('./phones.db');


// Retrieve all the products (supported by assigment 2)
app.get("/product", function (request, response) {

    db.all(`SELECT * FROM phones`, function (err, rows) {

        if (err) {
            return response.status(500).json(err.message)
        } else {

            /*
            Since the suitable header response for GET request is 200
            I wanted to prevent 304 response which means data comes from Cache
            To prevent this, I set header to store no cache.
            Every request will be responded fresh queries from DB
            and the response will be 200
            */

            response.setHeader('Cache-control', `no-store`)
            response.setHeader('Content-Type', 'application/json');
            return response.status(200).json(rows)

        }
    })
});

// add a product (supported by assigment 2)
app.post("/product", function (request, response) {

    let sql = 'INSERT INTO phones (image, brand, model, os, screensize) VALUES (?, ?, ?, ?, ?)'

    let data = [
        request.body.image,
        request.body.brand,
        request.body.model,
        request.body.os,
        request.body.screensize
    ]

    response.setHeader('Content-Type', 'application/json');

    db.run(sql, data, function (err) {
        if (err) {
            return response.status(500).json(err.message)
        } else {
            return response.status(201).json("The item has been created with the id of " + this.lastID);
        }
    })
})

// delete all the products (supported by assigment 2)
app.delete("/delete", function (request, response) {

    let sql = 'DELETE FROM phones';

    response.setHeader('Content-Type', 'application/json');

    db.run(sql, function (err) {
        if (err) {
            return response.status(500).json(err.message)
        } else {
            return response.status(204).send()
        }
    })
})

// delete a single element
app.get("/product/:id", function (request, response) {

    let sql = 'SELECT * FROM phones WHERE id = ?'

    let phoneId = request.params.id;

    response.setHeader('Content-Type', 'application/json');

    db.get(sql, phoneId, function (err, row) {
        if (err) {
            console.log(err.message)
            return response.status(400).json(err.message)
        } else if (row === undefined) { //where the item with id is not exist
            return response.status(404).json(phoneId + " is not exist")
        } else {
            return response.status(200).json(row)
        }
    })
})

// update a single element
app.patch("/product/:id", function (request, response) {

    let sql = `UPDATE phones set 
           image = COALESCE(?,image), 
           brand = COALESCE(?,brand), 
           model = COALESCE(?,model),
           os = COALESCE(?,os),
           screensize = COALESCE(?,screensize)
           WHERE id = ?`

    let data = [
        request.body.image,
        request.body.brand,
        request.body.model,
        request.body.os,
        request.body.screensize,
        request.params.id
    ]

    db.run(sql, data, function (err) {
        response.setHeader('Content-Type', 'application/json');
        if (err) {
            console.log(err.message)
            return response.status(400).json(err.message)
        }
        else if (this.changes == 0) { //where the item with id is not exist
            return response.status(404).json("There is no item with id " + request.params.id)
        }
        else {
            return response.status(204).send();
        }
    })
})

// delete a single element
app.delete("/delete/:id", function (request, response) {

    let sql = `DELETE FROM phones WHERE id = ?`

    let productId = request.params.id;

    db.run(sql, productId, function (err) {
        response.setHeader('Content-Type', 'application/json');
        if (err) {
            console.log(err.message)
            return response.status(400).json(err.message)
        }
        else if (this.changes == 0) { //where the item with id is not exist
            return response.status(404).json("There is no item with id " + productId)
        }
        else {
            return response.status(204).send()
        }
    })
})

// handle the wrong url requests
app.all('*', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json("404 Bad Request");
})

app.listen(3000, function () {
    console.log("listening port 3000...")
})