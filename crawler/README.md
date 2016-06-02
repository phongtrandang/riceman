## Images Crawler

We use [PhantomJS](http://phantomjs.org/) to crawl images from Google.  
We also use [ExpressJS](http://expressjs.com/) to serve as a minimal, server to run the service.

## Usage

Endpoint `http://localhost/api/v1/search/{query}/{number}`
- String `query` (required): string you want to search
- Number `number` (optional): number of results you want to return, maximum of 100.

Server returns an object with the following attributes:
- String `status`: `error` or `success`
- String `message`: message about error or success
- Array `images`: array of image urls