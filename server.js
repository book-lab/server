require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const cors = require('cors');
app.use(cors());
// 
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.get('/api/v1/books', (req,res) => {
    //query database for all books 
    client.query(`SELECT book_id, title, author, isbn, image_url, description FROM books;`)
        .then(data => res.send(data.rows));
    // res.send('will automatically send book data');
});


app.get('/api/v1/book/:id', (req,res) => {
    //query database for single books 
    client.query(`SELECT * FROM books WHERE book_id = $1;`, [req.params.id])
        .then(data => res.send(data.rows));
    
});

app.post('/api/v1/new', (req, res) => {
    client.query(`
    INSERT INTO books (title, author, isbn, image_url, description)
    VALUES ($1, $2, $3, $4, $5);
    `, [
        req.body.title,
        req.body.author,
        req.body.isbn,
        req.body.image_url,
        req.body.description
    ])
    .then(data => res.status(201).send(data.rows))
    .catch(console.error);
});



app.listen(PORT, () =>{
    console.log(`listening for api to port ${PORT}`);
});

//////////////////////////

function loadBooks() {
    fs.readFile('./book.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
        
            client.query(
                'INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5)',
                [ele.title, ele.author, ele.isbn, ele.image_url, ele.description ]
            )
                .catch(console.error);
        });
    });
}

loadBooks();