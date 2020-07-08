/**
 * External dependencies
 */
const core = require( '@actions/core' );

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	getAllBlocks,
} from '@wordpress/e2e-test-utils';

// We don't want to see warnings during these tests
console.warn = () => {};

const getThirdPartyBlocks = async () => {
	return page.evaluate( () => {
		const blocks = wp.data.select( 'core/blocks' ).getBlockTypes();

		return blocks
			.filter( ( i ) => ! i.name.startsWith( 'core' ) )
			.map( ( i ) => i.title ); // We return a new object the block can have a react element which not serializable and would result in an undefined list
	} );
};

const runTest = ( func, errorMessage ) => {
	try {
		func();
	} catch ( e ) {
		throw new Error( errorMessage );
	}
};

describe( 'Block Directory Tests', () => {
	beforeAll( async () => {
        await createNewPost();
        const payload = JSON.stringify(github.event.client_payload)
        console.log(payload)
        console.log( 'Running test for:', payload.block)
	} );

	beforeEach( async () => {
		// Remove all blocks from the post so that we're working with a clean slate
		await page.evaluate( () => {
			const blocks = wp.data.select( 'core/block-editor' ).getBlocks();
			const clientIds = blocks.map( ( block ) => block.clientId );
			wp.data.dispatch( 'core/block-editor' ).removeBlocks( clientIds );
		} );
	} );

	it( 'Block can be inserted in the document', async () => {
		try {
			const blocks = await getThirdPartyBlocks();

			runTest( () => {
				expect( blocks.length ).toBeGreaterThan( 0 );
			}, 'Could not find block in registered block list.' );

			runTest( () => {
				expect( blocks ).toHaveLength( 1 );
			}, 'Block registers multiple blocks.' );

			await insertBlock( blocks[ 0 ] );

			runTest( async () => {
				expect( await getAllBlocks() ).toHaveLength( 1 );
			}, 'Block was not found in document after insert.' );
		} catch ( e ) {
			core.setFailed( e );
		}
	} );
} );
