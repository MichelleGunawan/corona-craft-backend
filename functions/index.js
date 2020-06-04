const functions = require('firebase-functions');
const app = require('express')();
const express = require('express');
const cors = require('cors');


// Automatically allow cross-origin requests
app.use(cors({ origin: true }));


//makes sure only authorized/logged in people can post/upload images
const FBAuth = require('./util/fbAuth')
const {db} = require('./util/admin');

const{uploadImage, getAllPosts, createPost, getPost, commentOnPost, upvotePost, downvotePost, deletePost} = require('./handlers/posts');
const{signup, login, addUserDetails, getAuthenticatedUser} = require('./handlers/users'); 
//const{scraper}= require('./handlers/scraper');


//getAllScreams,createPost are functions located in posts.js
//retrieve posts
app.get('/posts', getAllPosts);
//create post
app.post('/post',FBAuth, createPost);

app.get('/post/:postId', getPost);
app.post('/post/:postId/comment', FBAuth, commentOnPost)
app.get('/post/:postId/upvote', FBAuth, upvotePost);
app.get('/post/:postId/downvote', FBAuth, downvotePost);
app.get('/post/:postId', FBAuth, deletePost);
app.post('/post/:postId/image',FBAuth, uploadImage);

//app.post('/posts/scraper',scraper);

//signup,login are functions located in users.js
// signup
app.post('/signup', signup);
//login
app.post('/login', login);  
//allow users to upload image
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);

