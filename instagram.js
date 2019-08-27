const QUERY_HASH = '472f257a40c653c64c666ce877d59d2b';

var totalPosts;
var pageID;

var mostComments;
var mostLikes;
var mostCommentedPictureURL;
var mostLikedPictureURL;

function getInstagramHandle() {
    return document.getElementById('instagram-handle').value;
}

function getInstagramURL(instagramHandle) {
    return `https://www.instagram.com/${instagramHandle}?_a=1`;
}

function getTotalPosts(instagramURL) {
    $.get(instagramURL, function(markup) {
        var doc = new DOMParser().parseFromString(markup, 'text/html');
        console.log(doc);
        var meta = doc.querySelector('meta[property="og:description"]');
        var value = meta && meta.getAttribute('content');
        
        totalPosts = parseInt(value.split(" ")[4], 10);
    });
}

function getPageID(instagramURL) {
    $.get(instagramURL, function(markup) {
        var doc = new DOMParser().parseFromString(markup, 'text/html');
        var meta = doc.querySelectorAll('script[type="text/javascript"]')[3];
        var value = meta.innerHTML;

        pageID = value.substring(value.indexOf('profilePage_') + 12, value.indexOf('show_suggested_profiles') - 3);
    });
}

function getInstagramGraphURL() {
    console.log(`https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${pageID}","first":${totalPosts}}`)
    return `https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${pageID}","first":${totalPosts}}`;
}

function getPictures(instagramGraphURL) {
    mostComments = 0;
    mostLikes = 0;

    $.get(instagramGraphURL, function(markup) {
        for (i = 0; i < 24; i++) {
            var node = markup['data']['user']['edge_owner_to_timeline_media']['edges'][`${i}`]['node'];
            var displayURL = node['display_url']

            if (mostLikes < node['edge_media_preview_like']['count']) {
                mostLikes = node['edge_media_preview_like']['count'];
                mostLikedPictureURL = displayURL;
            }

            if (mostComments < node['edge_media_to_comment']['count']) {
                mostComments = node['edge_media_to_comment']['count'];
                mostCommentedPictureURL = displayURL;
            }
        }
    });
}

function displayPictures() {
    document.getElementById('most-liked-picture').src = mostLikedPictureURL;
    document.getElementById('most-commented-picture').src = mostCommentedPictureURL;
}

document.getElementById('instagram-handle').addEventListener('keyup', function(e) {
    if (e.which === 13 || e.keyCode === 13) {
        var instagramURL = getInstagramURL(getInstagramHandle());

        getTotalPosts(instagramURL);
        getPageID(instagramURL);
        getPictures(getInstagramGraphURL());
        displayPictures();
    }
});

document.getElementById('submit-button').addEventListener('click', () => {
    var instagramURL = getInstagramURL(getInstagramHandle());
    getTotalPosts(instagramURL);
    getPageID(instagramURL);
    getPictures(getInstagramGraphURL());
    displayPictures();
});