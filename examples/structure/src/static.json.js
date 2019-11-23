/*
This file contains static values, settings, defaults and content for immediate available to the client.
This is not a replacement for a database. No sensitive information should be stored here. 

This file can be generated by the server.
*/

export default () => ({
	// There are two forms of localised content: 
	// - SSR/ default-html localised content
	// - Dynamic localised content
	// - Content within static html and SSR files are expected to be localised by the server.
	// - Content within the localisedContent property is also expected to be localised.
	// - No localisation should be performed in the front-end. Grammar variations should be provided.
    localisedContent: {},
    settings: {},
});


// @status: incomplete example