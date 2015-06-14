'use strict';

import jwtHelper from './jwt-helper';
import passport from 'koa-passport';
import parse from 'co-body';
import validate from 'parameter';
import db from 'src/server/db';

const router = require('koa-router')();

const User = db.users;

router
  .post('/auth/login', function *(next) {
    let user = yield parse(this);

    const rule = {
      password: 'password',
      email: 'email'
    };
    const errors = validate(rule, user);
    if (errors) {
      this.redirect('/login');
    }

    try {
      const profile = yield User.auth(user.email, user.password);

      if (!profile) {
        throw new Error('no user');
      }

      // response JSON web token
      const token = jwtHelper(profile);

      // set session token
      let sess = this.session;
      sess.token = token;

      this.redirect('/');
    }
    catch (err) {
      this.redirect('/login');
    }
  });

router
  .post('/auth/register', function *(next) {
    let user = yield parse(this);

    const rule = {
      email: 'email',
      password: {type: 'password', compare: 'passwordCheck', min: 6},
      tos: 'string'
    };

    const errors = validate(rule, user);
    if (errors) {
      this.redirect('/signup');
    }
    else {
      try {
        const profile = yield User.create(user);

        if (!profile) {
          throw new Error('no user');
        }

        // response JSON web token
        const token = jwtHelper(profile);

        // set session token
        let sess = this.session;
        sess.token = token;

        this.redirect('/sync/token?token=' + token);
      }
      catch (err) {
        this.redirect('/signup');
      }
    }

  });

router
  .post('/api/v1/login', function *(next) {
    const ctx = this;
    yield passport.authenticate('basic', {
      session: false,
    }, function*(err, profile, info) {
      if (!err && profile) {
        // response JSON web token
        const token = jwtHelper(profile);

        // set session token
        let sess = ctx.session;
        sess.token = token;

        ctx.body = {token: token};
      }
      else {
        ctx.status = 200;
        ctx.body = {profile};
      }
    });
  });

router
  .get('/auth/logout', function *(next) {
    this.session.token = null;
    this.logout();
    this.redirect('/');
  });

router
  .get('/auth/facebook', function *(next) {
    yield passport.authenticate('facebook', {scope: ['email']});
  });

router
  .get('/auth/facebook/request/email', function *(next) {
    yield passport.authenticate('facebook', {authType: 'rerequest', scope: ['email']});
  });

router
  .get('/auth/facebook/callback', function *(next) {
    let ctx = this;
    yield passport.authenticate('facebook', {
      failureRedirect: '/login',
    }, function*(err, profile, info) {
      if (!err) {
        const token = jwtHelper(profile);

        // set session token
        let sess = ctx.session;
        sess.token = token;

        ctx.redirect('/sync/token?token=' + token);
      }
      else {
        // need email
        console.log(err);
        ctx.redirect('/auth/facebook/request/email');
      }
    });
  });

module.exports = router;
