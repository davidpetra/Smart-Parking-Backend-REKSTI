// Smart Parking REKSTI

// Setting & import module
const express = require("express"),
    bodyParser = require("body-parser");

const app = express();

// Enabling CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    next();
});

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

require("dotenv").config();

connectDB = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME
};

const pgp = require("pg-promise")();
const CONNECT_DB =
    "postgres://" +
    connectDB.user +
    ":" +
    connectDB.pass +
    "@" +
    connectDB.host +
    ":" +
    connectDB.port +
    "/" +
    connectDB.name;
const db = pgp(CONNECT_DB);
const QueryResultError = pgp.errors.QueryResultError;
const QueryResultCode = pgp.errors.queryResultErrorCode;

// Query
function getParkiran() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM parkiran")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTiket() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM tiket")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getPembayaran() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM pembayaran")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

// Endpoint
app.get("/parkiran", function (req, res) {
    getParkiran()
        .then(result => {
            console.log("Success GET all parkiran");
            res.json(result);
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

app.get("/tiket", function (req, res) {
    getTiket()
        .then(result => {
            console.log("Success GET all tiket");
            res.json(result);
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

app.get("/pembayaran", function (req, res) {
    getPembayaran()
        .then(result => {
            console.log("Success GET all pembayaran");
            res.json(result);
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});


// Menjalankan Server
app.listen(3000);
