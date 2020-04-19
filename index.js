// Smart Parking REKSTI

// Setting & import module
const express = require("express"),
    bodyParser = require("body-parser");

const app = express();
const request = require('request');

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

// Functions
function duration(t0, t1) {
    let d = (new Date(t1)) - (new Date(t0));
    let weekdays = Math.floor(d / 1000 / 60 / 60 / 24 / 7);
    let days = Math.floor(d / 1000 / 60 / 60 / 24 - weekdays * 7);
    let hours = Math.floor(d / 1000 / 60 / 60 - weekdays * 7 * 24 - days * 24);
    let minutes = Math.floor(d / 1000 / 60 - weekdays * 7 * 24 * 60 - days * 24 * 60 - hours * 60);
    let seconds = Math.floor(d / 1000 - weekdays * 7 * 24 * 60 * 60 - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60);
    let milliseconds = Math.floor(d - weekdays * 7 * 24 * 60 * 60 * 1000 - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000 - minutes * 60 * 1000 - seconds * 1000);
    let t = {};
    ['weekdays', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'].forEach(q => {
        if (eval(q) > 0) {
            t[q] = eval(q);
        } else {
            t[q] = 0;
        }
    });
    return t;
}


// QUERY
// Parkiran
function getParkiran() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM parkiran ORDER BY slot_parkir")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getParkiranKosong() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM parkiran WHERE availability = FALSE ORDER BY slot_parkir")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getParkiranIsi() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM parkiran WHERE availability = TRUE ORDER BY slot_parkir")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function updateSlotParkiran(id, data) {
    return new Promise((resolve, reject) => {
        db.one(
            "UPDATE parkiran SET availability = $1 WHERE slot_parkir = $2 RETURNING *",
            [
                data.availability,
                id
            ]
        )
            .then(data => {
                console.log("Success update slot parkiran on slot_parkir: " + id);
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

// Tiket
function getTiket() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM tiket ORDER BY id_tiket")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTiketID(id) {
    return new Promise((resolve, reject) => {
        db.one("SELECT * FROM tiket WHERE id_tiket = $1", id)
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function makeTiket() {
    return new Promise((resolve, reject) => {
        var jam_masuk = Math.floor(Date.now() / 1000);
        var jam_keluar = null;
        var status = 'masuk';

        db.one(
            "INSERT INTO tiket(jam_masuk, jam_keluar, status) VALUES(to_timestamp($1),$2,$3) RETURNING *",
            [
                jam_masuk,
                jam_keluar,
                status,
            ]
        )
            .then(data => {
                console.log("Success make a new tiket with id_tiket: " + data.id_tiket)
                console.log(data)
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

function updateTiket(id) {
    return new Promise((resolve, reject) => {
        var jam_keluar = Math.floor(Date.now() / 1000);
        var status = 'keluar';

        db.one(
            "UPDATE tiket SET jam_keluar = to_timestamp($1), status = $2 WHERE id_tiket = $3 RETURNING *",
            [
                jam_keluar,
                status,
                id
            ]
        )
            .then(data => {
                console.log("Success update data tiket with id_tiket: " + id);
                console.log(data)
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

function deleteTiket(id) {
    return new Promise((resolve, reject) => {
        db.result("DELETE FROM tiket WHERE id_tiket = $1", id)
            .then(function () {
                //console.log("Success delete tiket");
                resolve("Success delete tiket");
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

// Pembayaran
function getPembayaran() {
    return new Promise((resolve, reject) => {
        db.any("SELECT * FROM pembayaran ORDER BY id_bayar")
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getPembayaranID(id) {
    return new Promise((resolve, reject) => {
        db.one("SELECT * FROM pembayaran WHERE id_bayar = $1", id)
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function makePembayaran(data) {
    return new Promise((resolve, reject) => {
        request('http://localhost:3000/tiket/' + data.id_tiket, function (error, response, body) {
            let isi = JSON.parse(body);
            let jam_masuk = isi['jam_masuk'];
            let jam_keluar = isi['jam_keluar'];
            let durasi = duration(jam_masuk, jam_keluar);
            let durasi_hari = durasi['days'];
            let durasi_jam = durasi['hours'];
            let durasi_menit = durasi['minutes'];
            let durasi_detik = durasi['seconds'];
            let gabung = [durasi_hari, durasi_jam, durasi_menit, durasi_detik];

            if (gabung[3] > 0 || gabung[2] > 0) {
                gabung[3] = 0;
                gabung[2] = 0;
                gabung[1] += 1;
            }

            if (gabung[0] > 0) {
                gabung[1] += 24 * gabung[0];
                gabung[0] = 0;
            }

            let durasi_parkir = gabung[1];
            let total_tagihan = 0;

            if (durasi_parkir > 1 && durasi_parkir < 13) {              // durasi parkir 2 - 12
                total_tagihan = 3000 + (2000 * (durasi_parkir - 1));
                console.log()
                console.log("Total tagihan parkir = " + total_tagihan)
            } else if (durasi_parkir >= 13) {
                total_tagihan = 25000;
                console.log()
                console.log("Total tagihan parkir = " + total_tagihan)
            } else if (durasi_parkir === 1) {
                total_tagihan = 3000;
                console.log()
                console.log("Total tagihan parkir = " + total_tagihan)
            } else {
                console.log()
                console.log("Durasi parkir salah!")
                console.log(total_tagihan)
            }

            let status_bayar = false;

            db.one(
                "INSERT INTO pembayaran(id_tiket, durasi_parkir, total_tagihan, status_bayar) VALUES($1,$2,$3,$4) RETURNING *",
                [
                    data.id_tiket,
                    durasi_parkir,
                    total_tagihan,
                    status_bayar,
                ]
            )
                .then(data => {
                    console.log("Success make a new pembayaran with id_bayar: " + data.id_bayar);
                    console.log(data)
                    resolve(data);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });


    });
}

function updatePembayaran(id, data) {
    return new Promise((resolve, reject) => {
        let status_bayar = true;

        db.one(
            "UPDATE pembayaran SET status_bayar = $1, jenis_pembayaran = $2 WHERE id_bayar = $3 RETURNING *",
            [
                status_bayar,
                data.jenis_pembayaran,
                id
            ]
        )
            .then(data => {
                console.log("Success update data pembayaran with id_bayar: " + id);
                console.log(data)
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

function deletePembayaran(id) {
    return new Promise((resolve, reject) => {
        db.result("DELETE FROM pembayaran WHERE id_bayar = $1", id)
            .then(function () {
                //console.log("Success delete pembayaran");
                resolve("Success delete pembayaran");
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

// ENDPOINT API
app.get("/", function (req, res) {
    res.redirect("/parkiran")
});

// Parkiran
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

app.get("/parkiran/kosong", function (req, res) {
    getParkiranKosong()
        .then(result => {
            console.log("Success GET all parkiran yang kosong");
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

app.get("/parkiran/isi", function (req, res) {
    getParkiranIsi()
        .then(result => {
            console.log("Success GET all parkiran yang terisi");
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

app.put("/parkiran/:id", function (req, res) {
    updateSlotParkiran(req.params.id, req.body)
        .then(result => {
            console.log(result);
            res.json({
                "response-code": "200",
                message: "Berhasil mengupdate slot parkiran!"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

// Tiket
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

app.get("/tiket/:id", function (req, res) {
    getTiketID(req.params.id)
        .then(result => {
            console.log("Success GET tiket by ID:", req.params.id);
            res.json(result);
        })
        .catch(err => {
            console.log(err);
            if (err instanceof QueryResultError) {
                if (err.code === QueryResultCode.noData) {
                    res.json({
                        "response-code": "404",
                        message: "Error 404: Tidak ada data yang ditemukan!"
                    });
                } else {
                    res.json({
                        "response-code": "500",
                        message: "Error 500: Internal server error!"
                    });
                }
            } else {
                res.json({
                    "response-code": "500",
                    message: "Error 500: Internal server error!"
                });
            }
        });
});

app.post("/tiket", function (req, res) {
    makeTiket()
        .then(result => {
            console.log();
            res.json({
                "response-code": "200",
                message: "Berhasil membuat tiket baru!"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

app.put("/tiket/:id", function (req, res) {
    updateTiket(req.params.id)
        .then(result => {
            console.log();
            res.json({
                "response-code": "200",
                message: "Berhasil mengupdate data tiket!"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

app.delete("/tiket/:id", function (req, res) {
    deleteTiket(req.params.id)
        .then(result => {
            console.log(result);
            res.json({
                "response-code": "200",
                message: "Berhasil menghapus data tiket!"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

// Pembayaran
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

app.get("/pembayaran/:id", function (req, res) {
    getPembayaranID(req.params.id)
        .then(result => {
            console.log("Success GET pembayaran by ID:", req.params.id);
            res.json(result);
        })
        .catch(err => {
            console.log(err);
            if (err instanceof QueryResultError) {
                if (err.code === QueryResultCode.noData) {
                    res.json({
                        "response-code": "404",
                        message: "Error 404: Tidak ada data yang ditemukan!"
                    });
                } else {
                    res.json({
                        "response-code": "500",
                        message: "Error 500: Internal server error!"
                    });
                }
            } else {
                res.json({
                    "response-code": "500",
                    message: "Error 500: Internal server error!"
                });
            }
        });
});

app.post("/pembayaran", function (req, res) {
    makePembayaran(req.body)
        .then(result => {
            console.log();
            res.json({
                "response-code": "200",
                message: "Berhasil mencatat pembayaran baru!"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

app.put("/pembayaran/:id", function (req, res) {
    updatePembayaran(req.params.id, req.body)
        .then(result => {
            console.log();
            res.json({
                "response-code": "200",
                message: "Berhasil mengupdate data pembayaran!"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                "response-code": "500",
                message: "Error 500: Internal server error!"
            });
        });
});

app.delete("/pembayaran/:id", function (req, res) {
    deletePembayaran(req.params.id)
        .then(result => {
            console.log(result);
            res.json({
                "response-code": "200",
                message: "Berhasil menghapus data pembayaran!"
            });
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Our app is running on port ', PORT);
});
//app.listen(3000);
