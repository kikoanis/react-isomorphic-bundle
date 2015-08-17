import React, { PropTypes } from 'react'
import Signup from './SignupComponent'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as SignupActions from '../actions/SignupActions'
import { updateTitle } from '../actions/LocaleActions'
import DocumentTitle from './addon/document-title'
import { BaseComponent } from 'shared/components'

@connect(state => ({
  signup: state.signup
}))
export default class SignupHandler extends BaseComponent {

  constructor (props, context) {
    super(props, context)
    const { dispatch } = context.store
    dispatch(updateTitle('title.signup'))

    dispatch(SignupActions.init())
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired,
    translator: PropTypes.object
  }

  render () {
    const title = this._T('title.signup')
    const defaultTitle = this._T('title.site')
    const { dispatch } = this.props
    return (
      <DocumentTitle title={title} defaultTitle={defaultTitle}>
        <Signup
          {...bindActionCreators(SignupActions, dispatch)}
          {...this.props}
        />
      </DocumentTitle>
    )
  }

}
