import React, { Component, PropTypes } from 'react'
import MediaQuery from 'react-responsive'
import Ad from 'shared/components/addon/ad'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as AdActions from 'shared/actions/AdActions'
import { isEmpty, find, endsWith } from 'lodash'

class ADContent extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    collect: PropTypes.object.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.AdL = null
    this.AdS = null
  }

  componentWillMount () {
    const { dispatch, collect } = this.props
    const { store: { resolver } } = this.context

    this.adActions = bindActionCreators(AdActions, dispatch)
    resolver.resolve(this.adActions.fetchSet)

    this.AdL = this.renderADItem('1L', find(collect))
    this.AdS = this.renderADItem('1S', find(collect))
  }

  componentWillUnmount () {
    this.AdL = null
    this.AdS = null
  }

  renderADItem (size) {
    const { ads } = this.props.collect
    const ad = find(ads, {name: size})
    if (!ad) return (<div></div>)

    const link = ad.script
    return (<Ad size={size} link={link} />)
  }

  render () {
    const { collect } = this.props
    if (!isEmpty(collect)) {
      return (
        <div className="row">
          <div className="ui basic segment center aligned">
            <MediaQuery maxDeviceWidth={374}>
              { this.AdS }
            </MediaQuery>
            <MediaQuery minDeviceWidth={375}>
              { this.AdL }
            </MediaQuery>
          </div>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}

export default connect(state => ({
  collect: state.ad
}))(ADContent)
