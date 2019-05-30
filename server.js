// Modules
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const body_parser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');
const url = require('url')
const sprintf = require('printj').sprintf;
const logit = require('./_logit');
const cors = require('./_cors');
var data = "a,b,c\n1,2,3".split("\n").map(x => x.split(","));
const XLSX = require('xlsx');
const zenziva = require('zenziva-sms');
const sms = new zenziva('userkey', 'passkey');    


const app = express();
// app.set('views', path.join(__dirname, 'views/'));

// Set view engine
app.set('view engine', 'hbs');
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

// Set public folder
app.use('/assets', express.static(__dirname + '/public'));


app.post('/sms-all', (req, res) => {
  let { pesan } = req.body;
  let query = "SELECT no_telepon FROM tbl_telepon";
  let exec = conn.query(query, (error, result) => {
    if(error)
      console.log(error);
    let arr = JSON.parse(JSON.stringify(result));
    arr.map( (item, key) =>  {
      sms.reguler(item.no_telepon, pesan)
        .then((response) => {
          console.log(response);
        }).catch((error) => {
          console.log(error);
        });
    });
    res.redirect('/')
  });
  // let ex = JSON.stringify(exec);
  // ex.forEach( k => console.log(k));
  // 
});

app.post('/sms', (req, res) => {
  let { no_telepon, pesan } = req.body;
  sms.reguler(no_telepon, pesan)
    .then((response) => {
      console.log(response);
      res.redirect('/');
    }).catch((error) => {
      console.log(error);
    });
});

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
        res.redirect('/read');
    });
});

// Update Record
app.post('/update', (req, res) => {
    console.log(req.query);
    console.log(req.body);
    let { id, pengguna, no_telepon, alamat, provider } = req.body;
    let query = `UPDATE tbl_telepon SET
                    pengguna = '${pengguna}',
                    no_telepon = '${no_telepon}',
                    alamat = '${alamat}',
                    provider = '${provider}'
                WHERE id = ${id}`;
    console.log(query);
    let exec = conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        res.redirect('/');
    });
});

// Delete Record
app.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    let query = `DELETE FROM tbl_telepon WHERE id = ${id}`;
    console.log(query);
    let exec = conn.query(query, (err, result) => {
        if (err)
            console.log(err);
        res.json(result);
    });
});

/* helper to generate the workbook object */
const make_book = () => {
  let ws = XLSX.utils.aoa_to_sheet(data);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
  return wb;
}

const get_data = (req, res, type) => {
  let wb = make_book();
  /* send buffer back */
  res.status(200).send(XLSX.write(wb, {type:'buffer', bookType:type}));
}

const get_file = (req, res, file) => {
  let wb = make_book();
  /* write using XLSX.writeFile */
  XLSX.writeFile(wb, file);
  res.status(200).send("wrote to " + file + "\n");
}

const load_data = (file) => {
  let wb = XLSX.readFile(file);
  /* generate array of arrays */
  data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
  fields = data.map( (item, key) => {
    if (key !== 0){  
      str = `${item}`.toString().split(',');
      return `('${str[0]}', '${str[1]}', '${str[2]}', '${str[3]}')`;    
    } 
  });
  fields.shift();
  query = `INSERT INTO tbl_telepon (pengguna, no_telepon, alamat, provider) VALUES ${fields}`;
  conn.query(query, (err, result) => {
    if (err)
      console.log(err);
    console.log(result);
  });
}

const post_data = (req, res) => {
  let keys = Object.keys(req.files), k = keys[0];
  load_data(req.files[k].path);
  res.status(200).redirect('/read');
}

const post_file = (req, res, file) => {
  console.log(file);
  res.status(200).redirect('/read');
}

// EXPORT IMPORT XLSX
app.use(logit.mw);
app.use(cors.mw);
app.use(require('express-formidable')());

app.get('/export', (req, res, next) => {
  let url = URL.parse(req.url, true);
  if(url.query.t) return get_data(req, res, url.query.t);
  else if(url.query.f) return get_file(req, res, url.query.f);
  res.status(403).end("Forbidden");
});

app.post('/import', (req, res, next) => {
  let _url = require('url').parse(req.url, true);
  if(_url.query.f) return post_file(req, res, _url.query.f);
  return post_data(req, res);
});

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


app.listen(8080, () => console.log(`Server running at port 8080`));