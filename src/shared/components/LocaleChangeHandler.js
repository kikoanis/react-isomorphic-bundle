import React, { Component, PropTypes } from 'react'
import counterpart from 'counterpart'
import { fixLocaleName } from 'shared/utils/locale-utils'
import moment from 'moment'
import 'moment/locale/zh-tw'
import 'moment/locale/zh-cn'

export default function localeChangeHandler() {
  return function wrapWithWrapper(WrappedComponent) {
    class Wrapper extends Component {
      static propTypes = {
        defaultLocale: PropTypes.string.isRequired
      }

      constructor (props) {
        super(props)
        this.state = { locale: props.defaultLocale }
      }

      componentDidMount () {
        counterpart.onLocaleChange(this.handleLocaleChange)
      }

      componentWillUnmount () {
        counterpart.offLocaleChange(this.handleLocaleChange)
      }

      handleLocaleChange = (newLocale) => {
        moment.locale(fixLocaleName(newLocale))
        this.setState({ locale: newLocale })
      }

      render() {
        return <WrappedComponent {...this.props} locale={ this.state.locale } />
      }
    }

    return Wrapper
  }
}
