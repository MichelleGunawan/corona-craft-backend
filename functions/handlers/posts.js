const {admin, db} = require('../util/admin');
const config = require('../util/config');

exports.getAllPosts = (req,res) => {
    db
    .collection('posts')
    .orderBy('voteCount', "desc")
    .get()
    .then((data) => {
        let posts = [];
        data.forEach((doc) => {
            posts.push({
                postId: doc.id,
                title: doc.data().title,
                body: doc.data().body,
                tag: doc.data().tag,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt,
                commentCount: doc.data().commentCount,
                voteCount: doc.data().voteCount,
                //userImage: doc.data().userImage
            });
        });
        return res.json(posts);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
    });
};

exports.createPost = (req, res) => {
    if (req.body.body.trim() === '') {
      return res.status(400).json({ body: 'Body must not be empty' });
    }

    const newPost = {
        title: req.body.title,
        body: req.body.body,
        tag: req.body.tag,
        userHandle: req.user.handle,
        //userImage: req.user.imageUrl,
        createdAt: new Date(),
        voteCount: 0,
        commentCount: 0
    };

    db
    .collection('posts')
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
};

exports.getPost = (req, res) => {
    let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Post not found' });
      }
      postData = doc.data();
      postData.postId = doc.id;
      return db
        .collection('comments')
        .orderBy('voteCount',"desc")
        .where('postId', '==', req.params.postId)
        .get();
    })
    .then((data) => {
      postData.comments = [];
      data.forEach((doc) => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnPost = (req, res) => {
    if (req.body.body.trim() === '')
      return res.status(400).json({ comment: 'Must not be empty' });
  
    const newComment = {
      body: req.body.body,
      //createdAt: new Date().toISOString(),
      postId: req.params.postId,
      userHandle: req.user.handle,
      //userImage: req.user.imageUrl
    };
    console.log(newComment);
  
    db.doc(`/posts/${req.params.postId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: 'Post not found' });
        }
        return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
      })
      .then(() => {
        return db.collection('comments').add(newComment);
      })
      .then(() => {
        res.json(newComment);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong' });
      });
  };

  exports.upvotePost = (req, res) => {
    const upvoteDocument = db
      .collection('upvotes')
      .where('userHandle', '==', req.user.handle)
      .where('postId', '==', req.params.postId)
      .limit(1);
    const downvoteDocument = db
      .collection('downvotes')
      .where('userHandle', '==', req.user.handle)
      .where('postId', '==', req.params.postId)
      .limit(1);
  
    const postDocument = db.doc(`/posts/${req.params.postId}`);
  
    let postData;
  
    postDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          postData = doc.data();
          postData.postId = doc.id;
          return downvoteDocument.get();
        } else {
          return res.status(404).json({ error: 'Post not found' });
        }
      })
      .then((data) => {
        if (data.empty) {
          return upvoteDocument.get();
          // return db
          //   .collection('votes')
          //   .add({
          //     postId: req.params.postId,
          //     userHandle: req.user.handle
          //   })
          //   .then(() => {
          //     postData.voteCount++;
          //     return postDocument.update({ voteCount: postData.voteCount });
          //   })
          //   .then(() => {
          //     return res.json(postData);
          //   });
        } else {
          return db
            .doc(`/downvotes/${data.docs[0].id}`)
            .delete()
            .then(() => {
              postData.voteCount++;
              return postDocument.update({ voteCount: postData.voteCount });
            })
            .then(() => {
              res.json(postData);
            }); 
          //return res.status(400).json({ error: 'Post already voted' });
        }
      })
      .then((data)=>{
        if (data.empty) {
          return db
            .collection('upvotes')
            .add({
              postId: req.params.postId,
              userHandle: req.user.handle
            })
            .then(() => {
              postData.voteCount++;
              return postDocument.update({ voteCount: postData.voteCount });
            })
            .then(() => {
              return res.json(postData);
            });
        } else {
          return res.status(400).json({ error: 'Post already upvoted' });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };
  
  exports.downvotePost = (req, res) => {
    const upvoteDocument = db
      .collection('upvotes')
      .where('userHandle', '==', req.user.handle)
      .where('postId', '==', req.params.postId)
      .limit(1);
    const downvoteDocument = db
      .collection('downvotes')
      .where('userHandle', '==', req.user.handle)
      .where('postId', '==', req.params.postId)
      .limit(1);
  
    const postDocument = db.doc(`/posts/${req.params.postId}`);
  
    let postData;
  
    postDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          postData = doc.data();
          postData.postId = doc.id;
          return upvoteDocument.get();
        } else {
          return res.status(404).json({ error: 'Post not found' });
        }
      })
      .then((data) => {
        if (data.empty) {
          return downvoteDocument.get();
          // return db
          //   .collection('votes')
          //   .add({
          //     postId: req.params.postId,
          //     userHandle: req.user.handle
          //   })
          //   .then(() => {
          //     postData.voteCount++;
          //     return postDocument.update({ voteCount: postData.voteCount });
          //   })
          //   .then(() => {
          //     return res.json(postData);
          //   });
        } else {
          return db
            .doc(`/upvotes/${data.docs[0].id}`)
            .delete()
            .then(() => {
              postData.voteCount--;
              return postDocument.update({ voteCount: postData.voteCount });
            })
            .then(() => {
              res.json(postData);
            }); 
          //return res.status(400).json({ error: 'Post already voted' });
        }
      })
      .then((data)=>{
        if (data.empty) {
          return db
            .collection('downvotes')
            .add({
              postId: req.params.postId,
              userHandle: req.user.handle
            })
            .then(() => {
              postData.voteCount--;
              return postDocument.update({ voteCount: postData.voteCount });
            })
            .then(() => {
              return res.json(postData);
            });
        } else {
          return res.status(400).json({ error: 'Post already downvoted' });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };

  // Delete a post
  exports.deletePost = (req, res) => {
    const document = db.doc(`/posts/${req.params.postId}`);
    document
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: 'Post not found' });
        }
        if (doc.data().userHandle !== req.user.handle) {
          return res.status(403).json({ error: 'Unauthorized' });
        } else {
          return document.delete();
        }
      })
      .then(() => {
        res.json({ message: 'Post deleted successfully' });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  };


 //uploads image
  //run npm install --save busboy
  exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
  
    const busboy = new BusBoy({ headers: req.headers });
  
    let imageFileName;
    let imageToBeUploaded = {};
  
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return res.status(400).json({ error: 'Wrong file type submitted' });
      }
      // my.image.png
      const imageExtension = filename.split('.')[filename.split('.').length - 1];
      // 645235423674523.png
      imageFileName = `${Math.round(
        Math.random() * 100000000000).toString()}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = { filepath, mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
      admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then(() => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
          return db.doc(`/posts/${req.params.postId}`).update({ image:imageUrl });
        })
        .then(() => {
          return res.json({ message: 'Image uploaded successfully' });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: 'something went wrong' });
        });
    });
    busboy.end(req.rawBody);
  };