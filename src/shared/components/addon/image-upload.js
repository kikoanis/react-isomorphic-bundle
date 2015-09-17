import React, { PropTypes } from 'react'
import Dropzone from 'react-dropzone'
import { connect } from 'react-redux'
import * as UploadActions from 'shared/actions/UploadActions'

@connect(state => ({
  upload: state.upload
}))
export default class ImageUpload extends React.Component {

  static propTypes = {
    index: PropTypes.number.isRequired,
    upload: PropTypes.object.isRequired,
    src: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  static defaultProps = {
    index: 0,
    src: '/images/image.png'
  }

  constructor (props) {
    super(props)
  }

  handleDrop (files) {
    const sizeLimit = 1024 * 1024 * 3
    const { dispatch } = this.props
    const file = files[0]
    if (file.size > sizeLimit) {
      dispatch(UploadActions.setErrorMessage('1', 'too large'))
      return
    }

    if (typeof file.preview !== 'undefined') {
      dispatch(UploadActions.clearErrorMessage())
      dispatch(UploadActions.send(file.name, file, this.props.index))

      const percentage = +this.props.upload.percentages[this.props.index]
    }
  }

  renderPrecentage (index) {
    const percentage = this.props.upload.percentages[index]
    if (!percentage) {
      return (
        <div
          className="ui yellow percentage message">
          <div>{percentage} %</div>
        </div>
      )
    } else if (percentage < 100) {
      return (
        <div
          className="ui red percentage message">
          <div>{percentage} %</div>
        </div>
      )
    } else {
      return (
        <div
          className="ui green percentage message">
          <div>{percentage} %</div>
        </div>
      )
    }
  }

  render () {
    let img
    if (typeof this.props.upload.images !== 'undefined') {
      img = this.props.upload.images[this.props.index]
    }

    return (
      <Dropzone
        multiple={false}
        style={{}}
        size={120}
        className="column"
        onDrop={::this.handleDrop}>
        <img
          className="ui image centered"
          alt=""
          src={ img || this.props.src } />
        {::this.renderPrecentage(this.props.index)}
      </Dropzone>
    )
  }
}
