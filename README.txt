KEN'S ENTREPRISE - READY PACKAGE

1. Copy this whole folder to:
   C:\Users\USER\Desktop\be\

2. Open PowerShell in the folder.

3. Run:
   npm install

4. Make sure MySQL is running and database kens_entreprise exists.
   If needed, run schema.sql in MySQL Shell.

5. Start:
   node server.js

6. Open:
   http://localhost:3000/

7. Admin login:
   http://localhost:3000/login.html

Admin:
   Username: admin
   Password: admin123

NOTE: This is the temporary local-learning login. Before putting the system online, replace plain-text passwords with bcrypt hashing and add proper sessions/JWT authentication.
