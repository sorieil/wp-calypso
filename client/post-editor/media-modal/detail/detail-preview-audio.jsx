/**
 * External dependencies
 */
var React = require( 'react' );
import classNames from 'classnames';

/**
 * Internal dependencies
 */
var MediaUtils = require( 'lib/media/utils' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewAudio',

	propTypes: {
		item: React.PropTypes.object.isRequired
	},

	render: function() {
		const classes = classNames( this.props.className, 'is-audio' );

		return (
			<audio
				src={ MediaUtils.url( this.props.item ) }
				controls
				className={ classes } />
		);
	}
} );
