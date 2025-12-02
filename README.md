Project name: Bookipedia
1. Group info:
	Group no. 71
	student name: 
        Man Timothy Tsz Hin 14140148,
        Tam Ho Chung 14121379,
        Yeung Kwan Ho 14115490,
        Lo Kam Hung 14120580,
        Liu YingQi 14099461

2. Project file intro
server.js :
Main Node.js/Express server file.
Sets up Express app, view engine (EJS), static files, and middleware.
Configures express-session for login sessions.
Integrates Passport with Facebook strategy and local username/password login.
Connects to MongoDB with Mongoose.

Defines all routes for:
Login / Register / Logout
Books CRUD web pages
Books RESTful API endpoints under /api/books

package.json:
Lists dependencies such as:
express, mongoose, ejs
express-session, passport, passport-facebook
body-parser, method-override
Contains npm scripts to start the server (e.g. "start": "node app.js").

public/ (folder):
Contains static assets.

styles.css: All styling for:
Library theme hero banner
Login/Register/Books pages
Book list cards with cover image space, colorful gradients, buttons, and responsive layout.

views/ (folder):
EJS templates rendered by Express:
login.ejs: Login form for existing users plus a “Register” button linking to /register, with library-themed hero section.
register.ejs: Registration form to create new users, with hero section and link back to login.
books.ejs: Main authenticated page to search, list, create, update, and delete books, including optional cover image URLs.
partials/header.ejs: Shared navigation/header (e.g., links to Books, Logout).

models/ (folder):
Book.js: Mongoose model for books:
title: String, required
author: String, required
isbn: String, required
photoUrl: String, optional (URL of cover image)

User.js: Mongoose model for users:
username: String
password: String (plain for demo; should be hashed in production)
facebookId: String (for Facebook OAuth login)

3. Cloud-based server URL
Cloud-based server URL (deployed on Render):

https://cloud-server-2.onrender.com

Use this URL for all browser testing and CURL testing commands below.

4. Operation guides
4.1 Use of Login/Logout pages
Access login page
URL: https://cloud-server-2.onrender.com/login

Page shows:
Library hero section (“Welcome to Bookipedia”)
Login form (username, password)
“Register” button linking to /register

Valid login information (example test account)

Username: demo123

Password: demo123

Login steps

Open /login
Enter username and password
Click “Login” button

On success, redirected to /books (Books CRUD page).

On failure, redirected back to /login with error message.

Register page

URL: https://cloud-server-2.onrender.com/register

Enter new username and password, click “Register”.

New user is saved in MongoDB , then redirected to /login.

Logout

Click “Logout” link in header, or open:

URL: https://cloud-server-2.onrender.com/logout

Session is destroyed and user is redirected to /login.

4.2 Use of CRUD web pages
Page: https://cloud-server-2.onrender.com/books (login required)

Features:
Search (Read)
Top form with fields:
Title   Author  ISBN
Enter any combination and click “Search”.

Server filters books using case-insensitive regex for title/author or exact match for ISBN and re-renders the list.
List books

All matching books are displayed in colorful cards.

Each card shows:
Cover area (photoUrl image if provided)
Title, author, ISBN
“Edit” link
“Delete” button

Create book (Create)
At bottom of page, “Create Book” form with fields:
Title (required)
Author (required)
ISBN (required)
Cover Image URL / photoUrl (optional)

After submit, a new Book document is saved and page reloads showing the new entry.

Edit/Update book (Update)
Click “Edit” on a book card.
Page shows an “Update Book” form pre-filled with that book’s data.
Change any field, click “Update”.

Server updates the book in MongoDB and redirects back to /books.

Delete book (Delete)
Click “Delete” on a card.
Form sends DELETE request via method-override.

Server deletes the book and reloads /books without that entry.

4.3 Use of RESTful CRUD services
All API endpoints are under /api/books and require an authenticated session.
Testing flow:

Register or login via CURL and store cookies.

Call the API endpoints with -b cookies.txt.

Base URL: https://cloud-server-2.onrender.com

4.3.1 Login via CURL and save session cookie
Step 1:
Register a new user (creates account and logs in, saving cookies)
curl -X POST https://cloud-server-2.onrender.com/register
-d "username=demo123&password=demo123"
-c cookies.txt

Step 2:
Log in (if the user already exists)
curl -X POST https://cloud-server-2.onrender.com/login
-d "username=demo123&password=demo123"
-c cookies.txt

Step 3:
List all books (GET /api/books)
curl https://cloud-server-2.onrender.com/api/books
-b cookies.txt

Step4:
Create a new book (POST /api/books, JSON body with photoUrl)
curl -X POST https://cloud-server-2.onrender.com/api/books
-H "Content-Type: application/json"
-d '{"title":"Library Sample Book","author":"Demo Author","isbn":"1234567890","photoUrl":"https://img.icons8.com/material/96/ffd3eb/book.png"}'
-b cookies.txt

Step 5:
List books with search filters (optional)

By title:
curl "https://cloud-server-2.onrender.com/api/books?title=Library"
-b cookies.txt

By author:
curl "https://cloud-server-2.onrender.com/api/books?author=Demo"
-b cookies.txt

By ISBN:
curl "https://cloud-server-2.onrender.com/api/books?isbn=1234567890"
-b cookies.txt


Step 6:
Update an existing book (PUT /api/books/:id)

First, get the book id from step 5 (field "_id").

Then run:

curl -X PUT https://cloud-server-2.onrender.com/api/books/<REPLACE_WITH_BOOK_ID>
-H "Content-Type: application/json"
-d '{"title":"Updated Title","author":"Demo Author","isbn":"9876543210","photoUrl":"https://img.icons8.com/material/96/ffe29c/book.png"}'
-b cookies.txt

Step 7
Delete a book (DELETE /api/books/:id)
curl -X DELETE https://cloud-server-2.onrender.com/api/books/<REPLACE_WITH_BOOK_ID>
-b cookies.txt

Step 8:
Logout (invalidate session)
curl https://cloud-server-2.onrender.com/logout
-b cookies.txt