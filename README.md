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

- Scraper library
 - I used Colly and also did some research on Chromedp(because of SPAs). I choose Colly to prototype the soluiton. The only limitation is clien side rendered web apps will have insuffient data through Collly.


#### TODOs
 - Add seeds for DB the task in the end

