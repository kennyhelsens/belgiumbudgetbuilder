// ABOUTME: Lets the masthead ask the home page to play the intro again, from any page of the site.
// ABOUTME: Each request bumps a counter; the home page opens the intro when the counter changes.
export const replay = $state({ requests: 0 });
