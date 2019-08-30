const QUERY_HASH = '472f257a40c653c64c666ce877d59d2b';

var profileID;
var pictures = [];

function getInstagramHandle() {
    return document.getElementById('instagram-handle').value;
}

function getInstagramURL(instagramHandle) {
    return `https://www.instagram.com/${instagramHandle}/?__a=1`;
}

function isValidUser(instagramURL) {
    let valid = true;

    $.getJSON({
        url: instagramURL,
        async: false,
        error: function (data) {
            valid = false;
        }
    });

    return valid;
}

function isPrivate(instagramURL) {
    let result;

    $.getJSON({
        url: instagramURL,
        async: false,
        success: function (data) {
            result = data.graphql.user.is_private;
        }
    });

    return Boolean(result);
}

function getInstagramGraphURL(firstPage, endCursor) {
    if (firstPage) {
        return `https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${profileID}","first":50}`;
    }
    else {
        return `https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${profileID}","first":50,"after":"${endCursor}"}`;
    }
}

function getProfileID(instagramURL) {
    $.getJSON({
        url: instagramURL,
        async: false,
        success: function (data) {
            profileID = data.logging_page_id.substring(12);
        },
        error: function (data) {
            console.log('FAILED');
        }
    })
}

function getTopPictures(instagramGraphURL) {
    $.getJSON({
        url: instagramGraphURL,
        async: false,
        success: function (data) {
            var edges = data.data.user.edge_owner_to_timeline_media.edges;
            endCursor = data.data.user.edge_owner_to_timeline_media.page_info.end_cursor;

            for (i = 0; i < edges.length; i++) {
                pictures.push([edges[i].node.edge_media_preview_like.count, edges[i].node.thumbnail_src]);
            }

            if (endCursor !== null) {
                getTopPictures(getInstagramGraphURL(false, endCursor));
            }

            pictures.sort((picX, picY) => {return picY[0] - picX[0]});
        }
    })
}

$('#instagram-handle').keyup(function(e) {
    if (e.which === 13) {
        var instagramURL = getInstagramURL(getInstagramHandle());

        if (!isValidUser(instagramURL) || isPrivate(instagramURL)) {
            /*  TODO
                - Handle nonexistent/private profiles
                - Animation? Shake search bar?
            */
            console.log("Try again!");
        } else {
            getProfileID(getInstagramURL(getInstagramHandle()));
            getTopPictures(getInstagramGraphURL(firstPage = true));
            displayPictures();
        }
    }
});

function displayPictures() {
    for (i = 0; i < 5; i++) {
        document.getElementById(`picture${i}`).src = pictures[i][1];
    }

    // Reset for next user search
    pictures = [];
}