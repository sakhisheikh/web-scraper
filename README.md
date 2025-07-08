# web-scraper


### backend


- MySQLServer
 using docker we run mysql server:
    ```docker run --name url-analyzer-mysql \
  -e MYSQL_ROOT_PASSWORD=my_secure_root_password \
  -e MYSQL_DATABASE=url_analyzer_db \
  -e MYSQL_USER=go_user \
  -e MYSQL_PASSWORD=go_user_password \
  -p 3306:3306 \
  -d mysql/mysql-server:8.0
    ```