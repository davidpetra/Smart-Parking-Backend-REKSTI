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
        db.none(
            "UPDATE parkiran SET availability = $1 WHERE slot_parkir = $2",
            [
                data.availability,
                id
            ]
        )
            .then(function () {
                console.log("Success update slot parkiran");
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

function makeTiket(data) {
    return new Promise((resolve, reject) => {
        db.none(
            "INSERT INTO tiket(id_tiket, jam_masuk, jam_keluar, status) VALUES($1,$2,$3,$4)",
            [
                data.id_tiket,
                data.jam_masuk,
                data.jam_keluar,
                data.status,
            ]
        )
            .then(function () {
                console.log("Success make a new tiket");
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

function updateTiket(id, data) {
    return new Promise((resolve, reject) => {
        db.none(
            "UPDATE tiket SET jam_keluar = $1, status = $2 WHERE id_tiket = $3",
            [
                data.jam_keluar,
                data.status,
                id
            ]
        )
            .then(function () {
                console.log("Success update data tiket");
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
        db.none("DELETE FROM tiket WHERE id_tiket = $1", id)
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
        db.none(
            "INSERT INTO pembayaran(id_bayar, id_tiket, durasi_parkir, total_tagihan, status_bayar, jenis_pembayaran) VALUES($1,$2,$3,$4,$5,$6)",
            [
                data.id_bayar,
                data.id_tiket,
                data.durasi_parkir,
                data.total_tagihan,
                data.status_bayar,
                data.jenis_pembayaran
            ]
        )
            .then(function () {
                console.log("Success make a new pembayaran");
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

function updatePembayaran(id, data) {
    return new Promise((resolve, reject) => {
        db.none(
            "UPDATE pembayaran SET durasi_parkir = $1, total_tagihan = $2, status_bayar = $3, jenis_pembayaran = $4 WHERE id_bayar = $5",
            [
                data.durasi_parkir,
                data.total_tagihan,
                data.status_bayar,
                data.jenis_pembayaran,
                id
            ]
        )
            .then(function () {
                console.log("Success update data pembayaran");
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
        db.none("DELETE FROM pembayaran WHERE id_bayar = $1", id)
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
    makeTiket(req.body)
        .then(result => {
            console.log(result);
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
    updateTiket(req.params.id, req.body)
        .then(result => {
            console.log(result);
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
            console.log(result);
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
            console.log(result);
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
    console.log('Our app is running on port ${ PORT }');
});
//app.listen(3000);
