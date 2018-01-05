require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const fs = require('fs');
const cors = require('cors'); 
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.use(cors());

app.get('/api/v1/books', (req,res) => {
    //query database for all books 
    client.query(`SELECT book_id, title, author, isbn, image_url, description FROM books;`)
        .then(data => res.send(data.rows));
    // res.send automatically sends book data
});

app.get('/api/v1/:id', (req,res) => {
    //queries database for all books 
    client.query(`SELECT * FROM books WHERE author_id = $1;`, [req.params.id])
        .then(data => res.send(data.rows))
        .catch(console.error);
    
});

app.get('/api/v1/search', (req, res) => {
    
    const googleUrl = 'https://www.googleapis.com/books/v1/volumes?q=intitle:';
    const searchBook = req.query.term
    console.log(`${googleUrl}dog&key=${G_API_KEY}`);
    console.log('this is search term ---------',searchBook);
    console.log(req.query); //figure out how we will implement query and where
    const string = `${googleUrl}${searchBook}&key=${G_API_KEY}`;
    console.log(string);
    superagent.get(string)
        .end((err, resp) => {
                console.log('this is console logging ' , resp.body);
                const topTen = resp.body.items.slice(0,10).map( book =>{
                    let returnData = {
                        
                        title: book.volumeInfo.title,
                        author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'NA',
                        isbn: book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0].identifier : 'NA',
                        image_url: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'NA' ,
                        description: book.volumeInfo.description ? book.volumeInfo.description : 'NA' 


                    };
                    return returnData;
                });
                
            res.send(topTen);
        });
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
    WHERE book_id = $1;`,
    [
        req.params.id
    ])
    .then(data => res.status(204).send('book deleted'))
    .catch(console.error);
});



app.listen(PORT, () =>{
    console.log(`listening for api to port ${PORT}`);
});

function loadBooks() {
    fs.readFile('./book.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
        
            client.query(
                'INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                [ele.title, ele.author, ele.isbn, ele.image_url, ele.description ]
            )
                .catch(console.error);
        });
    });
}

loadBooks();