/**
 * External dependencies
 */
import { expect, assert } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	getData,
	getError,
	getProgress,
	dispatchRequest,
	isHttpEgress,
	isHttpIngress,
	processHttpRequest,
} from '../utils.js';

import { WPCOM_HTTP_REQUEST } from 'state/action-types';

describe( 'WPCOM HTTP Data Layer', () => {
	describe( 'Utils', () => {
		describe( '#getData', () => {
			it( 'should return successful response data if available', () => {
				const data = { utterance: 'Bork bork' };
				const action = { type: 'SLUGGER', meta: { dataLayer: { data } } };

				expect( getData( action ) ).to.equal( data );
			} );

			it( 'should return null if no response data available', () => {
				const action = { type: 'SLUGGER' };

				expect( getData( action ) ).to.be.null;
			} );
		} );

		describe( '#getError', () => {
			it( 'should return failing error data if available', () => {
				const error = { utterance: 'Bork bork' };
				const action = { type: 'SLUGGER', meta: { dataLayer: { error } } };

				expect( getError( action ) ).to.equal( error );
			} );

			it( 'should return null if no error data available', () => {
				const action = { type: 'SLUGGER' };

				expect( getError( action ) ).to.be.null;
			} );
		} );

		describe( '#getProgress', () => {
			it( 'should return progress data if available', () => {
				const progress = { total: 1234, loaded: 123 };
				const action = { type: 'UPLOAD_PROGRESS', meta: { dataLayer: { progress } } };

				expect( getProgress( action ) ).to.equal( progress );
			} );
		} );

		describe( '#dispatchRequest', () => {
			const data = { count: 5 };
			const error = { message: 'oh no!' };
			const empty = { type: 'REFILL' };
			const progressInfo = { loaded: 45, total: 80 };
			const success = { type: 'REFILL', meta: { dataLayer: { data } } };
			const failure = { type: 'REFILL', meta: { dataLayer: { error } } };
			const progress = { type: 'REFILL', meta: { dataLayer: { progress: progressInfo } } };
			const both = { type: 'REFILL', meta: { dataLayer: { data, error } } };

			let initiator;
			let onSuccess;
			let onFailure;
			let onProgress;
			let dispatcher;
			let store;
			let next;

			beforeEach( () => {
				initiator = spy();
				onSuccess = spy();
				onFailure = spy();
				onProgress = spy();
				dispatcher = dispatchRequest( initiator, onSuccess, onFailure, onProgress );
				store = spy();
				next = spy();
			} );

			it( 'should call the initiator if meta information missing', () => {
				dispatcher( store, empty, next );

				expect( initiator ).to.have.been.calledWith( store, empty, next );
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.not.have.beenCalled;
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onSuccess if meta includes response data', () => {
				dispatcher( store, success, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.have.been.calledWith( store, success, next, data );
				expect( onFailure ).to.not.have.beenCalled;
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onFailure if meta includes error data', () => {
				dispatcher( store, failure, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.have.been.calledWith( store, failure, next, error );
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onFailure if meta includes both response data and error data', () => {
				dispatcher( store, both, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.have.been.calledWith( store, both, next, error );
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onProgress if meta includes progress data', () => {
				dispatcher( store, progress, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.not.have.beenCalled;
				expect( onProgress ).to.have.been.calledWith( store, progress, next, progressInfo );
			} );
		} );

		const ingressAction = { type: WPCOM_HTTP_REQUEST };
		const egressAction = { type: 'requestRooster', meta: { dataLayer: { data: 'Astro Chicken' } } };
		const unrelatedAction = { type: 'unrelated' };

		describe( '#isHttpIngress', () => {
			it( 'should return true for an action that is going to initiate a http request', () => {
				assert( isHttpIngress( ingressAction ) );
			} );

			it( 'should return false for any actions not of type WPCOM_HTTP_REQUEST', () => {
				assert.isFalse( isHttpIngress( unrelatedAction ) );
			} );
		} );

		describe( '#isHttpEgress', () => {
			it( 'should return true for any action that is the result of an onSuccess http handler', () => {
				assert( isHttpEgress( egressAction ) );
			} );

			it( 'should return true for any action that is the result of an onError http handler', () => {
				const action = { type: 'requestRooster', meta: { dataLayer: { error: 'no chickens' } } };
				assert( isHttpEgress( action ) );
			} );

			it( 'should return false for any actions without the onSuccess/onError meta', () => {
				const httpRequestAction = unrelatedAction;

				assert.isNotOk( isHttpEgress( unrelatedAction ) );
				assert.isNotOk( isHttpEgress( httpRequestAction ) );
			} );
		} );

		describe( '#processHttpRequest', () => {
			const handleIngress = spy();
			const handleEgress = spy();
			const next = spy();
			const store = spy();

			beforeEach( () => {
				handleIngress.reset();
				handleEgress.reset();
				next.reset();
			} );

			it( 'should call next if not ingress or egress', () => {
				processHttpRequest( handleIngress, handleEgress )( store )( next )( unrelatedAction );

				assert.equal( next.callCount, 1 );
				assert( next.calledWith( unrelatedAction ) );
			} );

			it( 'should not call next if ingress', () => {
				processHttpRequest( handleIngress, handleEgress )( store )( next )( ingressAction );
				assert.equal( next.callCount, 0 );
			} );

			it( 'should not call next if egress', () => {
				processHttpRequest( handleIngress, handleEgress )( store )( next )( egressAction );
				assert.equal( next.callCount, 0 );
			} );

			it( 'should call ingressProcessor if is ingress', () => {
				processHttpRequest( handleIngress, handleEgress )( store )( next )( ingressAction );
				assert.equal( handleIngress.callCount, 1 );
				assert.equal( handleEgress.callCount, 0 );
			} );

			it( 'should call egressProcessor if is egress', () => {
				processHttpRequest( handleIngress, handleEgress )( store )( next )( egressAction );
				assert.equal( handleEgress.callCount, 1 );
				assert.equal( handleIngress.callCount, 0 );
			} );
		} );
	} );
} );
