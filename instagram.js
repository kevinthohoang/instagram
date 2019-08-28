const QUERY_HASH = '472f257a40c653c64c666ce877d59d2b';

var endCursor, pictures, profileID, totalPosts;
pictures = [];

function getInstagramHandle() {
    return document.getElementById('instagram-handle').value;
}

function getInstagramURL(instagramHandle) {
    return `https://www.instagram.com/${instagramHandle}/?__a=1`;
}

function getInstagramGraphURL() {
    return `https://www.instagram.com/graphql/query/?query_hash=${QUERY_HASH}&variables={"id":"${profileID}","first":${totalPosts},"after":"${endCursor}"}`;
}

function getGraphQLVariables(instagramURL) {
    $.getJSON({
        url: instagramURL,
        success: function(data) {
            endCursor = data.graphql.user.edge_owner_to_timeline_media.page_info.end_cursor;
            profileID = data.logging_page_id.substring(12);
            totalPosts = data.graphql.user.edge_owner_to_timeline_media.count;
        },
        error: function(data) {
            console.log('FAILED');

            endCursor = 'QVFDMWhoQ3dSQWpTOVo1QXhPRmc2YWw0NF8wRy1Na0tiRjVuZjZYZFFIbC1yamUwX05xelhERk9samY1Xzk3cUhZb0ZNWkZTbHV3TFFHM1ROMjNIRWVaMQ==';
            profileID = '438970162';
            totalPosts = '120'
        }
    })
}

function getTopPictures(instagramGraphURL) {
    console.log(instagramGraphURL);

    $.getJSON({
        url: instagramGraphURL,
        success: function(data) {
            var edges = data.data.user.edge_owner_to_timeline_media.edges;
            endCursor = data.data.user.edge_owner_to_timeline_media.page_info.end_cursor;
            
            // Recursive call to load more photos
            if (endCursor !== null) {
                getTopPictures(getInstagramGraphURL());
            }

            for (i = 0; i < edges.length; i++) {
                pictures.push([edges[i].node.edge_media_preview_like.count, edges[i].node.thumbnail_src]);
            }

            pictures.sort((picX, picY) => {return picY[0] - picX[0]});
        }
    })
}

document.getElementById('instagram-handle').addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {

        getGraphQLVariables(getInstagramURL(getInstagramHandle()));
        getTopPictures(getInstagramGraphURL());
        console.log(pictures);
        console.log(pictures[0][1]);
        displayPictures();
    }
});

function displayPictures() {
    for (i = 1; i <= 5; i++) {
        document.getElementById(`picture${i}`).src = pictures[i][1];
    }
}