if database is not created, the error is: 
Unable to connect to the database: SequelizeConnectionError: (conn=101, no:1049, SQLState: 42000) Unknown database 'dev'

if the password is wrong and the username is correct, the error is: 
Unable to connect to the Database: SequelizeAccessDeniedError: (conn=112, no: 1045, SQLState: 28000) Access denied for user 'username'@'localhost' (using password:YES)

if the password is correct and the username is wrong, the error is: 
Unable to connect to the Database: SequelizeAccessDeniedError: (conn=113, no: 1045, SQLState: 28000) Access denied for user 'username'@'localhost' (using password:YES)

the mariadb installer is added to the assets of the application. 
during installation, the port, and password for root must be set, and that password 
and port used to update the system config. after that, update the path environment variable
with the path to the bin folder.
