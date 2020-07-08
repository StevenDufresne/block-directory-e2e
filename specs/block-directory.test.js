/**
 * External dependencies
 */
const core = require( '@actions/core' );

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	searchForBlock,
	getEditedPostContent,
	deactivatePlugin,
	uninstallPlugin,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */

import { getThirdPartyBlocks, runTest, removeAllBlocks } from '../utils';

// We don't want to see warnings during these tests
console.warn = () => {};

describe( `Block Directory Tests`, () => {
	beforeEach( async () => {
		await createNewPost();
		await removeAllBlocks();
	} );

	afterAll( async () => {
		const blocks = await getThirdPartyBlocks();

		await deactivatePlugin( 'wp-p5js-block' );
		await uninstallPlugin( 'wp-p5js-block' );
	} );

	it( 'Block returns from API as expected', async () => {
		try {
			// Search for the block via the inserter
			await searchForBlock( 'p5' );

			let addBtn = await page.waitForSelector(
				'.block-directory-downloadable-blocks-list li:first-child button'
			);

			runTest( () => {
				expect( addBtn ).toBeDefined();
			}, "The block wasn't returned from the API." );

			// Add the block
			await addBtn.click();
			await new Promise( ( resolve ) => setTimeout( resolve, 5000 ) );
			const content = await getEditedPostContent();

			runTest( () => {
				expect( content.length ).toBeGreaterThan( 0 );
			}, "Couldn't install the block." );
		} catch ( e ) {
			core.setFailed( e );
		}
	} );
} );
