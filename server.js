require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
// 
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.get('/api/v1/books', (req,res) => {
    //query database for all books 
    client.query(`SELECT title, author, image_url FROM books;`)
        .then(data => res.send(data.rows));
    // res.send('will automatically send book data');
});

app.get('/api/v1/:id', (req,res) => {
    //query database for all books 
    client.query(`SELECT * FROM books WHERE author_id = $1;`, [req.params.id])
        .then(data => res.send(data.rows));
    
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