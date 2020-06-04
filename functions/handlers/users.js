const {admin, db} = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const {validateSignupData, validateLoginData, reduceUserDetails} = require('../util/validators');

exports.signup = (req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle
    };
  
    const { valid, errors } = validateSignupData(newUser);
  
    if (!valid) return res.status(400).json(errors);
  
    const noImg = 'no-img.png';

    let token, userId;
    db.doc(`/users/${newUser.handle}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return res.status(400).json({ handle: 'this handle is already taken' });
        } else {
          return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then((data) => {
        userId = data.user.uid;
        return data.user.getIdToken();
      })
      .then((idToken) => {
        token = idToken;
        const userCredentials = {
          handle: newUser.handle,
          email: newUser.email,
          createdAt: new Date().toISOString(),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
              
          userId
        };
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then(() => {
        return res.status(201).json({ token, userId });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          return res.status(400).json({ email: 'Email is already is use' });
        } 
        else {
          return res.status(500).json({ general: 'Somethinge went wrong. Please try again' });
        }
    });
};
  
exports.login = (req, res) => {
    const user = {
      email: req.body.email,
      password: req.body.password
    };
  
    const { valid, errors } = validateLoginData(user);
  
    if (!valid) return res.status(400).json(errors);
  
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        userId = data.user.uid;
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token, userId});
      })
      .catch((err) => {
        console.error(err);
        if (err.code === 'auth/wrong-password') {
          return res
            .status(403)
            .json({ general: 'Wrong credentials, please try again' });
        } 
        else return res.status(500).json({ error: err.code });
    });
};

  // Add user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);
  
    db.doc(`/users/${req.user.handle}`)
      .update(userDetails)
      .then(() => {
        return res.json({ message: 'Details added successfully' });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  };

  // Get own user details
  exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.handle}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
            return res.json(doc.data());
        }
        /*  
          userData.credentials = doc.data();
          return db
            .collection('votes')
            .where('userHandle', '==', req.user.handle)
            .get();
        }
      })
      .then((data) => {
        userData.votes = [];
        data.forEach((doc) => {
          userData.votes.push(doc.data());
        });
        return res.json(userData);*/
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  };


  
