const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const app = express();
const port = process.env.PORT || 3000;

// Models
const Book = require('./models/Book');
const User = require('./models/User');

// Middleware (順序不可錯)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method')); // For PUT/DELETE in forms
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// 先啟動 session middleware
app.use(session({
  secret: 'your-secret-key', // Change for production!
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set true for HTTPS
}));

// 再啟動 passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect('mongodb+srv://work:work@lab01test.iszzytc.mongodb.net/bookdb?retryWrites=true&w=majority&appName=lab01test')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Passport config for Facebook
passport.use(new FacebookStrategy({
  clientID: 'YOUR_FACEBOOK_CLIENT_ID', // 填自己的
  clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET',
  callbackURL: '/auth/facebook/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ facebookId: profile.id });
  if (!user) {
    user = new User({ username: profile.displayName, facebookId: profile.id });
    await user.save();
  }
  done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Middleware to check if user is authenticated (session/local login)
const isAuthenticated = (req, res, next) => {
  if (req.session.userId || req.user) {
    return next();
  }
  res.redirect('/login');
};
const apiAuthenticated = (req, res, next) => {
  if (req.session.userId || req.user) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Routes: Auth
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  const error = req.query.error || '';
  res.render('login', { error });
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && user.password === password) {
    req.session.userId = user._id;
    res.redirect('/books');
  } else {
    res.redirect('/login?error=Account Not Found')
  }
});
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.redirect('/register?error=ACccount have been registed');
  }
  const user = new User({ username, password }); // bcrypt production
  await user.save();
  req.session.userId = user._id;
  res.redirect('/books');
});
app.get('/logout', (req, res, next) => {
  req.session.destroy(() => {
    // 有 Passport 時安全登出
    if (typeof req.logout === "function") 
      {res.redirect('/login');
      
    } else {
      req.logout((err) => {
        // 若 Passport 有錯誤則直接顯示
        if (err) { return next(err); }
        res.redirect('/login');
      });
      
    }
  });
});
// Facebook Auth routes
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/books',
    failureRedirect: '/login?error=facebooklogin-fail'
  })
);

// Books CRUD (login required)
app.get('/books', isAuthenticated, async (req, res) => {
  const { title, author, isbn } = req.query;
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
  res.render('books', { books: await Book.find({}), editBook: book });
});
app.put('/books/:id', isAuthenticated, async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/books');
});
app.delete('/books/:id', isAuthenticated, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/books');
});

// RESTful API (No auth)
app.get('/api/books', apiAuthenticated, async (req, res) => {
  const { title, author, isbn } = req.query;
  let query = {};
  if (title) query.title = { $regex: title, $options: 'i' };
  if (author) query.author = { $regex: author, $options: 'i' };
  if (isbn) query.isbn = isbn;
  const books = await Book.find(query);
  res.json(books);
});
app.post('/api/books', apiAuthenticated, async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});
app.put('/api/books/:id', apiAuthenticated, async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
});
app.delete('/api/books/:id', apiAuthenticated, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});


app.listen(port, () => console.log(`Server running on port ${port}`));
