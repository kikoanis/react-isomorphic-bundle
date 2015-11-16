import React, { Component, PropTypes } from 'react'
import { BaseComponent } from 'shared/components'
import { Link } from 'react-router'
import { isEmpty, at } from 'lodash'
import { toShortDate } from 'shared/utils/date-utils'
import { PostPropArray } from 'shared/utils/forms'
import counterpart from 'counterpart'
import { originLocaleName } from 'shared/utils/locale-utils'
import { tongwenAutoStr } from 'shared/utils/tongwen'
import localeChangeHandler from './LocaleChangeHandler'

@localeChangeHandler()
export default class HomeComponent extends Component {

  static propTypes = {
    post: PropTypes.object.isRequired,
    defaultLocale: PropTypes.string.isRequired,
    locale: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = { locale: props.defaultLocale}
  }

  renderNews (posts) {
    if (!isEmpty(posts)) {
      return posts.map(function (post) {
        return this.renderItem(post)
      }.bind(this))
    } else {
      return <div></div>
    }
  }

  renderItem (post) {
    const Translate = require('react-translate-component')

    const eventDate = (post.startDate === post.endDate)
    ? toShortDate(post.endDate)
    : toShortDate(post.startDate) + ' - ' + toShortDate(post.endDate)

    const locale = this.props.locale || this.state.locale

    return (
    <div key={post.id} className="ui orange icon message">
      <div className="content">
        <h3>
          <Link to={`/w/${post.id}`}>
            <span className="ui orange">
              [{at(PostPropArray(originLocaleName(locale)), post.prop)}]
            </span>
            <span> </span>
            {tongwenAutoStr(post.ocname, locale)
              || <Translate content="news.unnamed" />}
          </Link>
        </h3>
        <div className="header">
          {tongwenAutoStr(post.title, locale)}
        </div>
      </div>
    </div>
    )
  }

  render () {
    const Translate = require('react-translate-component')
    const { posts } = this.props.post
    const loading = this.props.post.isFetching

    return (
      <main className="ui has-header grid centered container">
        <div className="sixteen wide tablet ten wide computer column">
          <div className="ui grid">
            <div className="tablet computer only row">
              <Link to="/w/cal" className="ui orange fluid huge button">
                <Translate content="home.browse" />
              </Link>
            </div>
            <div className="mobile only row">
              <Link to="/w/today" className="ui orange fluid huge button">
                <Translate content="home.browse" />
              </Link>
            </div>
          </div>
          { ::this.renderNews(posts) }
          {loading && isEmpty(posts) && (
            <div className="ui segment basic has-header">
              <div className="ui active inverted dimmer">
                <div className="ui indeterminate text loader">
                  <Translate content="wall.loading" />
                </div>
              </div>
            </div>
          )}
          {!loading && isEmpty(posts) && (
            <div>
              <div className="ui hidden divider"></div>
              <div className="ui segment basic has-header center aligned">
                <Translate content="post.nodata" />
              </div>
            </div>
          )}
          <div className="ui basic segment center">
            <h3>
              <a href="http://www.ccnda.org" target="_blank">
                <div className="image logo"></div>
              </a>
            </h3>
          </div>
        </div>
      </main>
    )
  }
}
