// Modules
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const body_parser = require('body-parser');
const mysql = require('mysql');
const app = express();

// Connection config
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'buku_telepon'
});

// Connect to database
conn.connect( err => {
    if (err)
        console.log(err);
    console.log('Connecting to mysql ..');
});

// Set view dir
app.set('views', path.join(__dirname, 'views/'));

// Set view engine
app.set('view engine', 'hbs');
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

// Set public folder
app.use('/assets', express.static(__dirname + '/public'));

// Home page
app.get('/read', (req, res) => {
    let query = "SELECT * FROM tbl_telepon";
    let exec = conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        res.json(result);
    });
}); 

// Get by Id
app.get('/read/:id', (req, res) => {
    let id = req.params.id;
    let query = `SELECT * FROM tbl_telepon WHERE id = ${id}`;
    conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        res.json(result);
        console.log(result);
    })
})

// Insert Record
app.post('/insert', (req, res) => {
    let { pengguna, no_telepon, alamat, provider } = req.body;
    console.log(req.body);
    let query = `INSERT INTO tbl_telepon (pengguna, no_telepon, alamat, provider)
        VALUES ('${pengguna}', '${no_telepon}', '${alamat}', '${provider}')`;
    console.log(query);
    let exec = conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        // res.json(result);
        res.redirect('/read');
    });
});

// Update Record
app.post('/update', (req, res) => {
    let { id, pengguna, no_telepon, alamat, provider } = req.body;
    let query = `UPDATE tbl_telepon SET
                    pengguna = '${pengguna}',
                    no_telepon = '${no_telepon}',
                    alamat = '${alamat}',
                    provider = '${provider}'
                WHERE id = ${id}`;
    let exec = conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        res.json(result);
    });
});

// Delete Record
app.post('/delete', (req, res) => {
    let query = `DELETE FROM tbl_telepon WHERE id = ${req.body.id}`;
    // console.log(query);
    let exec = conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        res.json(result);
    }) ;
});

app.listen(8080, () => console.log(`Server running at port 8080`));