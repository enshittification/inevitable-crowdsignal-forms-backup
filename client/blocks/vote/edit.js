/**
 * External dependencies
 */
import React, { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import SideBar from './sidebar';
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { __ } from 'lib/i18n';
import withClientId from 'components/with-client-id';
import {
	startSubscriptions,
	startPolling,
	withPollDataSelect,
	withPollDataDispatch,
} from 'blocks/poll/subscriptions';

startSubscriptions();

const isP2tenberg = () => 'p2tenberg' in window;

const EditVoteBlock = ( props ) => {
	const {
		attributes,
		className,
		pollDataFromApi,
		addPollClientId,
		removePollClientId,
	} = props;

	useEffect( () => {
		if ( isP2tenberg() ) {
			startPolling();
		}

		if ( attributes.pollId ) {
			addPollClientId( attributes.pollId );
		}

		return () => {
			if ( attributes.pollId ) {
				removePollClientId( attributes.pollId );
			}
		};
	}, [] );

	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal Vote' ) }
		>
			<SideBar { ...props } viewResultsUrl={ viewResultsUrl } />
			<div className={ className }>
				<InnerBlocks
					template={ [
						[ 'crowdsignal-forms/vote-item', { type: 'up' } ],
						[ 'crowdsignal-forms/vote-item', { type: 'down' } ],
					] }
					templateLock="insert"
					allowedBlocks={ [ 'crowdsignal-forms/vote-item' ] }
					orientation="horizontal"
					__experimentalMoverDirection="horizontal" // required for pre WP 5.5, post 5.5 only requires `orientation` to be set
				/>
			</div>
		</ConnectToCrowdsignal>
	);
};

export default compose( [ withPollDataSelect(), withPollDataDispatch() ] )(
	withClientId( EditVoteBlock, 'pollId' )
);
