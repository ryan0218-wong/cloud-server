# cloud-server

1.login ac

curl -X POST https://cloud-server-2.onrender.com/login -d "username=123&password=123" -c cookies.txt
login ac

2.list the book

curl -X GET https://cloud-server-2.onrender.com/api/books -b cookies.txt

3.use filter "author" to search book

curl "https://cloud-server-2.onrender.com/api/books?author=Lee" -b cookies.txt

4.make a book which name Library

curl -X POST https://cloud-server-2.onrender.com/api/books -H "Content-Type: application/json" -d '{"title":"Library Sample Book","author":"Demo Author","isbn":"1234567890","photoUrl":"https://img.icons8.com/material/96/ffd3eb/book.png"%7D' -b cookies.txt

5.use filter "linrary" to search book

curl "https://cloud-server-2.onrender.com/api/books?title=Library" -b cookies.txt

6.update the book data

curl -X PUT https://cloud-server-2.onrender.com/api/books/<ID> -H "Content-Type: application/json" -d '{"title":"Updated Sample","author":"Demo Author","isbn":"1234567890","photoUrl":"https://img.icons8.com/material/96/ffd3eb/book.png"%7D' -b cookies.txt

7.Delete the book

curl -X DELETE https://cloud-server-2.onrender.com/api/books/656abcd1234567xxxxxx -b cookies.txt

8.use filter

curl "https://cloud-server-2.onrender.com/api/books?title=Updated" -b cookies.txt

9.logout

curl https://cloud-server-2.onrender.com/logout -b cookies.txt 
