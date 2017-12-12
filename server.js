require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
    INSERT INTO books (title, author, isbn, "image_url", description)
    VALUES ($1, $2, $3, $4, $5);
    `, [
        req.body.title,
        req.body.author,
        req.body.isbn,
        req.body.image_url,
        req.body.description
    ])
    .then(data => res.status(200).send(data.rows))
    .catch(console.error);
});

app.put('/api/v1/books/:id', (req, res) => {
    client.query(`UPDATE books SET title = $1, author = $2, isbn = $3, image_url = $4, description = $5 WHERE book_id = $6`, 
    [
        req.body.title,
        req.body.author,
        req.body.isbn,
        req.body.image_url,
        req.body.description,
        req.params.id
    ])
    .then(data => res.status(200).send('book updated'))
    .catch(console.error);
});


app.delete('/api/v1/books/:id', (req, res) => {
    console.log('inside the server delete route')
    client.query(`
    DELETE FROM books
    WHERE book_id = $1`,
    [
        req.params.id
    ])
    .then(data => res.status(204).send('book deleted'))
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