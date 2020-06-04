/*const puppeteer = require('puppeteer');
const {admin, db} = require('../util/admin');

const SUBREDDIT_URL = (reddit) => `https://old.reddit.com/r/${reddit}/`;


exports.scraper = (req,res) => {
    const self = {
        browser: null,
        page: null,

        initialize: async (reddit) => {

            self.browser = await puppeteer.launch({headless: true});
            self.page = await self.browser.newPage();

            //GO to the subreddit with pupeteer
            await self.page.goto(SUBREDDIT_URL(reddit), { waitUntil: 'networkidle0' })

        },

        getResults: async (tag, sub) => {

            let elements = await self.page.$$('#siteTable > div[class*="thing"]');
            //let results = [];


            for (let element of elements){

                let title = await element.$eval(('p[class="title"]'), node => node.innerText.trim());
                let postURL = await element.$eval(('a[class*="title"]'), node => node.getAttribute('href'));
                //let rank = await element.$eval(('span[class="rank"]'), node => node.innerText.trim());
                //let postTime = await element.$eval(('p[class="tagline "] > time'), node => node.getAttribute('title'));
                //let authorURL = await element.$eval(('p[class="tagline "] > a[class*="author"]'), node => node.getAttribute('href'));
                let author = await element.$eval(('p[class="tagline "] > a[class*="author"]'), node => node.innerText.trim());
                //let score = await element.$eval(('div[class="score likes"]'), node => node.innerText.trim());


                if (postURL.substring(0,2) == "/r")
                    postURL = "https://old.reddit.com" + postURL
                
                const newPost = {
                    title,
                    postURL,
                    tag,
                    author,
                    //sub
                };
                
                db
                .collection('scraped')
                .add(newPost)
                .then((doc) => {
                    const resPost = newPost;
                    resPost.postId = doc.id;
                    res.json(resPost);
                })
                .catch((err) => {
                    res.status(500).json({ error: 'something went wrong' });
                    console.error(err);
                 });


                //results.push(post)
            }
            //return results;
        }

    }   
} */