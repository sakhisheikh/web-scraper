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

  Limitations:
All these findings can be addressed later in the future as I focused on a workable solution for now given the time contraints.
   - netflix returned zero html tags as it was client side rendered webpage `"https://www.netflix.com/browse"`. we need headless crawler for that that comes with performance overhead `chromedp` as it would be slow and would require more infrastructure (e.g we need chromium for that)
   - Iframe was not crawled. We need to grab iframe `src`, it needs to be crawled within the crawl routine or a separate one
   - Checking inaccessible is a concurrent blocking operation request, ideally we can offoload that task to separate process/goroutine and send back the partial response to the client and show inaccessible are still processing and update it real time as the processing finishes.
   - Bot detection (403 forbidden) 
   - Observed login form can also be dynamically added through JS so could be skipped by `colly`, `chromedp` could
   be a nice option.


#### TODOs
 - Add seeds for DB the task in the end

