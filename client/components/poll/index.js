/**
 * External dependencies
 */
import React, { useState } from 'react';
import seedrandom from 'seedrandom';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
} from 'blocks/poll/util';
import { ClosedPollState, ConfirmMessageType } from 'blocks/poll/constants';
import ClosedBanner from './closed-banner';
import PollResults from './results';
import PollVote from './vote';
import { maybeAddTemporaryAnswerIds, shuffleWithGenerator } from './util';
import { __ } from 'lib/i18n';
import { usePollVote } from 'data/hooks';
import { CrowdsignalFormsError } from 'data/poll';

const Poll = ( { attributes } ) => {
	const [ randomAnswerSeed ] = useState( Math.random() );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const { hasVoted, isVoting, vote } = usePollVote();

	const handleSubmit = async ( selectedAnswerIds ) => {
		// temporary hard-codes for testing
		const pollId = 10507885; // attributes.pollId
		selectedAnswerIds = [ 48608813 ];
		// END temp

		try {
			setErrorMessage( '' );

			await vote( pollId, selectedAnswerIds );

			if (
				ConfirmMessageType.REDIRECT === attributes.confirmMessageType
			) {
				window.location = attributes.redirectAddress;
			}
		} catch ( ex ) {
			if ( ex instanceof CrowdsignalFormsError ) {
				setErrorMessage( ex.message );
			} else {
				setErrorMessage( __( 'Server error. Please try again.' ) );
			}
		}
	};

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	if ( isClosed && ClosedPollState.HIDDEN === attributes.closedPollState ) {
		return null;
	}

	const showResults =
		( isClosed &&
			ClosedPollState.SHOW_RESULTS === attributes.closedPollState ) ||
		( hasVoted &&
			ConfirmMessageType.RESULTS === attributes.confirmMessageType );

	const classes = getBlockCssClasses(
		attributes,
		attributes.className,
		'wp-block-crowdsignal-forms-poll',
		{
			'has-voted': hasVoted,
			'is-closed': isClosed,
			'is-voting': isVoting,
		}
	);

	const answers = shuffleWithGenerator(
		filter( attributes.answers, ( answer ) => !! answer.text ),
		attributes.randomizeAnswers
			? new seedrandom( randomAnswerSeed )
			: () => 1
	);

	return (
		<div className={ classes } style={ getStyleVars( attributes, {} ) }>
			<div className="wp-block-crowdsignal-forms-poll__content">
				<h3 className="wp-block-crowdsignal-forms-poll__question">
					{ attributes.question }
				</h3>

				{ attributes.note && (
					<p className="wp-block-crowdsignal-forms-poll__note">
						{ attributes.note }
					</p>
				) }

				{ ! showResults && (
					<>
						<PollVote
							answers={ maybeAddTemporaryAnswerIds( answers ) }
							isMultipleChoice={ attributes.isMultipleChoice }
							onSubmit={ handleSubmit }
							submitButtonLabel={ attributes.submitButtonLabel }
							hasVoted={ hasVoted }
							isVoting={ isVoting }
						/>
						{ '' !== errorMessage && (
							<div className="wp-block-crowdsignal-forms-poll__error">
								{ errorMessage }
							</div>
						) }
						{ hasVoted && (
							<div className="wp-block-crowdsignal-forms-poll__submit-message">
								{ ConfirmMessageType.THANK_YOU ===
									attributes.confirmMessageType &&
									__( 'Thanks for voting!' ) }
								{ ConfirmMessageType.CUSTOM_TEXT ===
									attributes.confirmMessageType &&
									attributes.customConfirmMessage }
							</div>
						) }
					</>
				) }

				{ showResults && (
					<PollResults
						answers={ maybeAddTemporaryAnswerIds( answers ) }
					/>
				) }
			</div>

			{ isClosed && <ClosedBanner /> }
		</div>
	);
};

export default Poll;
