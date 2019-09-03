const QUERY_HASH = '472f257a40c653c64c666ce877d59d2b';

let profileID;
let photos = [];

function getInstagramHandle() {
    return document.getElementById('instagram-handle').value;
}

function getInstagramURL(instagramHandle) {
    return `https://www.instagram.com/${instagramHandle}/?__a=1`;
}

function getInstagramGraphURL(firstPage, endCursor) {
    if (firstPage) {
        return `https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${profileID}","first":50}`;
    }
    else {
        return `https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${profileID}","first":50,"after":"${endCursor}"}`;
    }
}

function isValidUser(instagramURL) {
    let valid = true;

    data = $.getJSON({
        url: instagramURL,
        async: false,
        error: function (data) {
            valid = false;
        }
    });

    return [valid, data.responseJSON];
}

function isPrivate(data) {
    return Boolean(data.graphql.user.is_private);
}

function getProfileID(data) {
    return data.logging_page_id.substring(12);
}

function getTopPhotos(instagramGraphURL) {
    $.getJSON({
        url: instagramGraphURL,
        async: false,
        success: function (data) {
            let edges = data.data.user.edge_owner_to_timeline_media.edges;
            endCursor = data.data.user.edge_owner_to_timeline_media.page_info.end_cursor;

            for (i = 0; i < edges.length; i++) {
                photos.push([edges[i].node.edge_media_preview_like.count, edges[i].node.thumbnail_src]);
            }

            if (endCursor !== null) {
                getTopPhotos(getInstagramGraphURL(false, endCursor));
            }

            photos.sort((photoX, photoY) => {return photoY[0] - photoX[0]});
        }
    })
    /*  TODO
        Loading icon?
    */
}

function displayPhotos() {
    for (i = 0; i < 5; i++) {
        document.getElementById(`photo${i}`).src = photos[i][1];
    }

    // Reset for next user search
    photos = [];
}

$('#instagram-handle').keyup(function (e) {
    if (e.which === 13) {
        let instagramURL = getInstagramURL(getInstagramHandle());
        let [valid, data] = isValidUser(instagramURL);
        
        if (!valid || isPrivate(data)) {
            /*  TODO
                - Handle nonexistent/private profiles
                - Animation? Shake search bar?
            */
            console.log("Try again!");
        } else {
            profileID = getProfileID(data);
            getTopPhotos(getInstagramGraphURL(firstPage = true));
            displayPhotos();
        }
    }
});

$('img').mouseenter(function () {
    document.getElementById(this.id).style.opacity = 0.5;
}).mouseleave(function () {
    document.getElementById(this.id).style.opacity = 1.0;
});

/*
.mouseleave(function () {
    console.log("test2");
});*/

/*  TODO
    Hide img html while there's no photos
*/

/*  TODO
    Submit button?
*/