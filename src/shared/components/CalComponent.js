import React, { PropTypes } from 'react'
import { isEmpty } from 'lodash'
import Cards from 'shared/components/wall/PostCards'
import DayPicker from 'react-day-picker'
import { LocaleUtils } from 'react-day-picker/lib/addons'
import { isSameDay } from 'shared/utils/date-utils'
import moment from 'moment'
import 'moment/locale/zh-tw'
import counterpart from 'counterpart'
import WallButtons from 'shared/components/wall/WallButtons'
import { fixLocaleName } from 'shared/utils/locale-utils'

if (process.env.BROWSER) {
  require('css/ui/date-picker')
}

export default class Cal extends React.Component {

  static propTypes = {
    fetchList: PropTypes.func.isRequired,
    countPostsWithCal: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
    defaultLocale: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)

    counterpart.setLocale(props.defaultLocale)
    moment.locale(fixLocaleName(counterpart.getLocale()))

    this.state = {
      locale: fixLocaleName(counterpart.getLocale()),
      date: moment(new Date()).startOf('day').valueOf(),
      selectedDay: new Date()
    }

    counterpart.onLocaleChange(::this.handleLocaleChange)
  }

  getTodayCount (date) {
    if (typeof date !== 'undefined') {
      const count = this.props.post.count[date]
      return typeof count !== 'undefined' && count !== null ? count : 0
    } else {
      return 0
    }
  }

  getTodayStartCount (date) {
    if (typeof date !== 'undefined') {
      const count = this.props.post.countStart[date]
      return typeof count !== 'undefined' && count !== null ? count : 0
    } else {
      return 0
    }
  }

  renderDay (day) {
    const date = day.getDate()
    const count = this.getTodayStartCount(date)

    return (
      <div>
        <div className="day">
          { date }
        </div>
        { count > 0 && (<span className="event-started">＊</span>) }
        { count === 0 && (<span className="event-none">＊</span>) }
      </div>
    )
  }

  /* eslint-disable max-len */
  render () {
    const Translate = require('react-translate-component')
    const { post } = this.props
    const loading = post.isFetching || false
    const { locale } = this.state
    const { selectedDay } = this.state
    const modifiers = {
      'sunday': (day) => day.getDay() === 0,
      'saturday': (day) => day.getDay() === 6,
      'selected': (day) => isSameDay(selectedDay, day),
      'has-events-lv1': (day) => this.getTodayCount(day.getDate()) > 0
    }

    return (
      <main className="ui two column has-header stackable grid container">
        <div className="eight wide computer sixteen wide tablet column">
          <WallButtons />
          <DayPicker
            renderDay={::this.renderDay}
            modifiers={modifiers}
            onDayClick={::this.handleDayClick}
            onMonthChange={::this.handleMonthChange}
            locale={locale}
            localeUtils={LocaleUtils}
          />
        </div>
        <div className="eight wide computer sixteen wide tablet column">
          <div className="ui horizontal header divider">
            { moment(selectedDay).format('LL') }
          </div>
          <div className="row">
            <Cards
              posts={post.posts}
              loadFunc={::this.loadFunc}
              hasMore={post.hasMore}
              diff={113}
              defaultLocale={this.props.defaultLocale}
            />
            {loading && isEmpty(post.posts) && (
              <div className="ui segment basic has-header">
                <div className="ui active inverted dimmer">
                  <div className="ui indeterminate text loader">
                    <Translate content="wall.loading" />
                  </div>
                </div>
              </div>
            )}
            {!loading && isEmpty(post.posts) && (
              <div>
                <div className="ui hidden divider"></div>
                <div className="ui segment basic has-header center aligned">
                  <Translate content="post.nodata" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  handleDayClick (e, day) {
    const date = moment(day).valueOf()
    const reload = true
    this.props.fetchList(0, 10, date, null, reload)

    this.setState({
      date: date,
      selectedDay: day
    })
  }

  handleMonthChange (day) {
    this.props.countPostsWithCal(moment(day).year(), moment(day).month() + 1)
  }

  handleLocaleChange (newLocale) {
    if (process.env.BROWSER) {
      const locale = fixLocaleName(newLocale)
      moment.locale(locale)
      this.setState({ locale })
    }
  }

  loadFunc () {
    const { post } = this.props
    this.props.fetchList(post.offset, post.limit, this.state.date)
  }

}
