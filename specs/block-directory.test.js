/**
 * External dependencies
 */
const core = require( '@actions/core' );
const github = require( '@actions/github' );

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	searchForBlock,
	getEditedPostContent,
	deactivatePlugin,
	uninstallPlugin,
	insertBlock,
	getAllBlocks,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */

import {
	getInstalledBlocks,
	getThirdPartyBlocks,
	runTest,
	removeAllBlocks,
} from '../utils';

// We don't want to see warnings during these tests
console.warn = () => {};

describe( `Block Directory Tests`, () => {
	beforeEach( async () => {
		await createNewPost();
		await removeAllBlocks();
	} );

	// afterAll( async () => {
	// 	const [ block ] = await getThirdPartyBlocks();

	// 	console.log( 'Deactivating: ', block.id );
	// 	await deactivatePlugin( block.id );

	// 	console.log( 'Uninstalling: ', block.id );
	// 	await uninstallPlugin( block.id );
	// } );

	it( 'Block returns from API and installs', async () => {
		try {
            const { searchTerm } = github.context.payload.client_payload;
            
			console.log( 'Running a search for: ', searchTerm );
			// Search for the block via the inserter
			await searchForBlock( searchTerm );

			let addBtn = await page.waitForSelector(
				'.block-directory-downloadable-blocks-list li:first-child button'
			);

			runTest( () => {
				expect( addBtn ).toBeDefined();
			}, "The block wasn't returned from the API." );

			// Add the block
			await addBtn.click();

			// This timeout is necessary to allow the state to update -> Probably a better way.
			await new Promise( ( resolve ) => setTimeout( resolve, 10000 ) );
			const content = await getEditedPostContent();
            console.log(content);
			runTest( () => {
				expect( content.length ).toBeGreaterThan( 0 );
			}, "Couldn't install the block." );
		} catch ( e ) {
			core.setFailed( e );
		}
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
			const blockList = await getAllBlocks();

			runTest( () => {
				expect( blockList ).toHaveLength( 1 );
			}, 'Block was not found in document after insert.' );
		} catch ( e ) {
			core.setFailed( e );
		}
	} );
} );
