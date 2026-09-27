/**
 * A blog page's metadata: core's `pageMetadata`, which resolves an app's
 * page the way a page is resolved (its own metadata, then the route's, then
 * the site's defaults) and adds only the app's structured data and type.
 */
export { pageMetadata as blogMetadata } from 'parche:utils/metadata';
