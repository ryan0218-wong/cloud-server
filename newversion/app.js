const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
const port = process.env.PORT || 3000;

// Models
const Book = require('./models/Book');
const User = require('./models/User');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // For PUT/DELETE in forms
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'your-secret-key', // Change this in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true for HTTPS in production
}));

// MongoDB Connection (replace with your Atlas URI)
mongoose.connect('mongodb+srv://work:work@lab01test.iszzytc.mongodb.net/bookdb?retryWrites=true&w=majority&appName=lab01test')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.set('views', __dirname + '/views');
// Routes: Auth
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && user.password === password) { // Simple check; use bcrypt in production
    req.session.userId = user._id;
    res.redirect('/books');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.redirect('/register'); // Handle error better in prod
  }
  const user = new User({ username, password }); // Hash password in prod
  await user.save();
  req.session.userId = user._id;
  res.redirect('/books');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Routes: CRUD Web Pages (Authenticated)
app.get('/books', isAuthenticated, async (req, res) => {
  const { title, author, isbn } = req.query; // For search
  let query = {};
  if (title) query.title = { $regex: title, $options: 'i' };
  if (author) query.author = { $regex: author, $options: 'i' };
  if (isbn) query.isbn = isbn;
  const books = await Book.find(query);
  res.render('books', { books, editBook: null });
});

app.post('/books', isAuthenticated, async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.redirect('/books');
});

app.get('/books/:id/edit', isAuthenticated, async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render('books', { books: await Book.find({}), editBook: book }); // Reuse template
});

app.put('/books/:id', isAuthenticated, async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/books');
});

app.delete('/books/:id', isAuthenticated, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/books');
});

// RESTful APIs (No Auth)
app.get('/api/books', async (req, res) => {
  const { title, author, isbn } = req.query;
  let query = {};
  if (title) query.title = { $regex: title, $options: 'i' };
  if (author) query.author = { $regex: author, $options: 'i' };
  if (isbn) query.isbn = isbn;
  const books = await Book.find(query);
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
});

app.delete('/api/books/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
