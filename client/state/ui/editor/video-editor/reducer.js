/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	VIDEO_EDITOR_POSTER_UPDATE,
	VIDEO_EDITOR_POSTER_UPDATE_FAILURE,
	VIDEO_EDITOR_POSTER_UPDATE_SUCCESS,
	VIDEO_EDITOR_SCRIPT_LOAD_ERROR,
	VIDEO_EDITOR_STATE_RESET,
	VIDEO_EDITOR_STATE_RESET_POSTER,
	VIDEO_EDITOR_VIDEO_HAS_LOADED,
} from 'state/action-types';

/**
 * Tracks video loading state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
const videoIsLoading = ( state = true, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_VIDEO_HAS_LOADED:
			return false;

		case VIDEO_EDITOR_STATE_RESET:
			return true;
	}

	return state;
};

/**
 * Tracks poster updated state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
const posterIsUpdated = ( state = false, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_POSTER_UPDATE_SUCCESS:
		case VIDEO_EDITOR_POSTER_UPDATE_FAILURE:
			return true;

		case VIDEO_EDITOR_STATE_RESET:
		case VIDEO_EDITOR_STATE_RESET_POSTER:
			return false;
	}

	return state;
};

/**
 * Tracks poster error state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
const hasPosterUpdateError = ( state = false, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_POSTER_UPDATE:
		case VIDEO_EDITOR_POSTER_UPDATE_SUCCESS:
		case VIDEO_EDITOR_STATE_RESET:
		case VIDEO_EDITOR_STATE_RESET_POSTER:
			return false;

		case VIDEO_EDITOR_POSTER_UPDATE_FAILURE:
			return true;
	}

	return state;
};

/**
 * Tracks VideoPress script loading state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
const hasScriptLoadError = ( state = false, action ) => {
	switch ( action.type ) {
		case VIDEO_EDITOR_SCRIPT_LOAD_ERROR:
			return true;

		case VIDEO_EDITOR_STATE_RESET:
			return false;
	}

	return state;
};

export default combineReducers( {
	hasPosterUpdateError,
	hasScriptLoadError,
	posterIsUpdated,
	videoIsLoading,
} );
