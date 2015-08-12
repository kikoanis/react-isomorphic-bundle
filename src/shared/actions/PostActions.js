import LOCAL_PATH from 'shared/utils/localpath'
import request from 'superagent'
import jwt from 'jsonwebtoken'
import { isArray, clone, compact } from 'lodash'
import moment from 'moment'
import {
  CREATE_POST_STARTED,
  CREATE_POST_COMPLETED,
  CREATE_POST_FAILED,
  UPDATE_POST_STARTED,
  UPDATE_POST_COMPLETED,
  UPDATE_POST_FAILED,
  REMOVE_POST_STARTED,
  REMOVE_POST_COMPLETED,
  REMOVE_POST_FAILED,
  SHOW_POST_STARTED,
  SHOW_POST_COMPLETED,
  SHOW_POST_FAILED,
  LIST_POST_STARTED,
  LIST_POST_COMPLETED,
  LIST_POST_FAILED,
  COUNT_POST_IN_MONTH_STARTED,
  COUNT_POST_IN_MONTH_COMPLETED,
  COUNT_POST_IN_MONTH_FAILED
} from 'shared/constants/ActionTypes'
import { getToken } from 'shared/actions/AuthActions'
import { clearUpload } from 'shared/actions/UploadActions'

export function init () {
  return async dispatch => {
    return dispatch({ type: CREATE_POST_STARTED })
  }
}

export function submit ({ value, regValue, upload, map }) {
  return async dispatch => {
    try {
      const token = getToken()
      const content = await create({ token, value, regValue, upload, map })

      if (content.uid) {
        dispatch(clearUpload())
        return dispatch({
          type: CREATE_POST_COMPLETED,
          content: content
        })
      } else return dispatch({
        type: CREATE_POST_FAILED,
        errors: content.errors ? content.errors : content
      })
    } catch (err) {
      return dispatch({
        type: CREATE_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function modify ({ id, value, regValue, upload, map }) {
  return async dispatch => {
    try {
      const token = getToken()
      const content = await update({ token, id, value, regValue, upload, map })

      if (content.uid) {
        dispatch(clearUpload())
        return dispatch({
          type: UPDATE_POST_COMPLETED,
          content: content
        })
      } else return dispatch({
        type: UPDATE_POST_FAILED,
        errors: content.errors ? content.errors : content
      })
    } catch (err) {
      return dispatch({
        type: UPDATE_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function remove (id) {
  return async dispatch => {
    try {
      const token = getToken()
      const content = await destroy({ token, id })

      if (content.uid)
        return dispatch({
          type: REMOVE_POST_COMPLETED
        })
      else return dispatch({
        type: REMOVE_POST_FAILED,
        errors: content.errors ? content.errors : content
      })
    } catch (err) {
      return dispatch({
        type: REMOVE_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function show (id) {
  return async dispatch => {
    dispatch({ type: SHOW_POST_STARTED })
    try {
      const post = await get(id)
      if (typeof post !== 'undefined')
        return dispatch({
          type: SHOW_POST_COMPLETED,
          detail: post
        })
      else
        return dispatch({
          type: SHOW_POST_FAILED,
          errors: post.errors ? post.errors : post
        })
    } catch (err) {
      return dispatch({
        type: SHOW_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function defaultList (offset=0, limit=5, reload=false) {
  return async dispatch => {
    if (reload)
      dispatch({ type: LIST_POST_STARTED })
    try {
      const posts = await list(offset, limit)
      if (isArray(posts))
        return dispatch({
          type: LIST_POST_COMPLETED,
          posts: posts,
          offset: offset,
          limit: limit
        })
      else
        return dispatch({
          type: LIST_POST_FAILED,
          errors: posts.errors ? posts.errors : posts
        })
    } catch (err) {
      return dispatch({
        type: LIST_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function defaultListWithUser (offset=0, limit=5, user, reload=false) {
  return async dispatch => {
    if (reload)
      dispatch({ type: LIST_POST_STARTED })
    try {
      const posts = await list(offset, limit, user)
      if (isArray(posts))
        return dispatch({
          type: LIST_POST_COMPLETED,
          posts: posts,
          offset: offset,
          limit: limit
        })
      else
        return dispatch({
          type: LIST_POST_FAILED,
          errors: posts.errors ? posts.errors : posts
        })
    } catch (err) {
      return dispatch({
        type: LIST_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function fetchList (offset=0, limit=5, start, end, reload) {
  return async dispatch => {
    if (reload)
      dispatch({ type: LIST_POST_STARTED })
    try {
      const posts = await fetch(offset, limit, start, end)
      if (isArray(posts))
        return dispatch({
          type: LIST_POST_COMPLETED,
          posts: posts
        })
      else
        return dispatch({
          type: LIST_POST_FAILED,
          errors: posts.errors ? posts.errors : posts
        })
    } catch (err) {
      return dispatch({
        type: LIST_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function fetchListWithUser (offset=0, limit=5, start, end, user) {
  return async dispatch => {
    try {
      const posts = await fetch(offset, limit, start, end, user)
      if (isArray(posts))
        return dispatch({
          type: LIST_POST_COMPLETED,
          posts: posts
        })
      else
        return dispatch({
          type: LIST_POST_FAILED,
          errors: posts.errors ? posts.errors : posts
        })
    } catch (err) {
      return dispatch({
        type: LIST_POST_FAILED,
        errors: err.message
      })
    }
  }
}

export function countPostsWithCal (year, month) {
  return async dispatch => {
    dispatch({ type: COUNT_POST_IN_MONTH_STARTED })
    try {
      const cals = await countPostInMonth(year, month)
      if (cals && isArray(cals.count))
        return dispatch({
          type: COUNT_POST_IN_MONTH_COMPLETED,
          cals: cals
        })
      else
        return dispatch({
          type: COUNT_POST_IN_MONTH_FAILED,
          errors: cals.errors ? cals.errors : cals
        })
    } catch (err) {
      return dispatch({
        type: COUNT_POST_IN_MONTH_FAILED,
        errors: err.message
      })
    }
  }
}

async function create ({ token, value, regValue, upload, map }) {
  const _upload = compact(upload)
  return new Promise((resolve, reject) => {
    const user = jwt.decode(token)
    if (!user.id) reject('invalid token')
    const _form = clone(value)
    _form.uid = user.id
    _form.startDate = moment(_form.startDate).valueOf()
    _form.endDate = moment(_form.endDate).valueOf()
    _form.openDate = moment(regValue.openDate).valueOf()
    _form.closeDate = moment(regValue.closeDate).valueOf()
    _form.url = regValue.url
    if (map && typeof map.lat !== undefined && typeof map.lng !== undefined) {
      _form.lat = map.lat
      _form.lng = map.lng
      _form.place = map.place
    }
    _form.file = _upload
    request
      .post('/api/v1/posts')
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + token)
      .send(_form)
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

async function update ({ token, id, value, regValue, upload, map }) {
  const _upload = compact(upload)
  return new Promise((resolve, reject) => {
    const user = jwt.decode(token)
    if (!user.id) reject('invalid token')
    const _form = clone(value)
    _form.uid = user.id
    _form.startDate = moment(_form.startDate).valueOf()
    _form.endDate = moment(_form.endDate).valueOf()
    _form.openDate = moment(regValue.openDate).valueOf()
    _form.closeDate = moment(regValue.closeDate).valueOf()
    _form.url = regValue.url
    if (map && typeof map.lat !== undefined && typeof map.lng !== undefined) {
      _form.lat = map.lat
      _form.lng = map.lng
      _form.place = map.place
    }
    _form.file = _upload
    request
      .put('/api/v1/posts/' + id)
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + token)
      .send(_form)
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

async function destroy ({ token, id }) {
  return new Promise((resolve, reject) => {
    const user = jwt.decode(token)
    if (!user.id) reject('invalid token')
    request
      .del('/api/v1/posts/' + id)
      .set('Accept', 'application/json')
      .set('Authorization', 'JWT ' + token)
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

async function get (id) {
  return new Promise((resolve, reject) => {
    request
      .get(LOCAL_PATH + '/api/v1/posts/' + id)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}


async function list (offset, limit, user) {
  return new Promise((resolve, reject) => {
    request
      .get(LOCAL_PATH + '/api/v1/posts')
      .query({ offset: offset })
      .query({ limit: limit })
      .query({ user: user })
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

async function fetch (offset, limit, start, end, user) {
  return new Promise((resolve, reject) => {
    request
      .get(LOCAL_PATH + '/api/v1/posts')
      .query({ offset: offset })
      .query({ limit: limit })
      .query({ start: start })
      .query({ end: end })
      .query({ user: user })
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

async function countPostInMonth (year, month) {
  return new Promise((resolve, reject) => {
    request
      .get(LOCAL_PATH + '/api/v1/cals')
      .query({ action: 'countPostInMonth' })
      .query({ year: year })
      .query({ month: month })
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}
