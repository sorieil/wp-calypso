/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class VideoEditorUploadButton extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const {
			children,
			className,
		} = this.props;
		const classes = classNames( 'video-editor__upload-button', className );

		return (
			<form ref="form" className={ classes }>
				<span>{ children }</span>
				<input
					type="file"
					accept="image/*"
					className="video-editor__upload-button-input" />
			</form>
		);
	}
}

export default VideoEditorUploadButton;
