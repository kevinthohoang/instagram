/*
    TODO:
    - Display likes and comments on photo hover
    - Fix profile information layout
    - Round followers and following
    - Fix timing of loader
    - Fix photo sizes
    - Fix photo rows for different zooms
    - Change fonts
*/
const QUERY_HASH = '472f257a40c653c64c666ce877d59d2b';

let profileID;
let photos = [];

function getInstagramHandle() {
    return document.getElementById('instagram-handle-search').value;
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

function getProfileInfo(data) {
    let user = data.graphql.user;

    /*
        0: Profile Picture  3: Following  
        1: Posts            4: Full Name
        2: Followers        5: Biography
    */
    return [user.profile_pic_url, user.edge_owner_to_timeline_media.count, user.edge_followed_by.count, 
            user.edge_follow.count, user.full_name, user.biography]
}

function getTopPhotos(instagramGraphURL) {
    $.getJSON({
        url: instagramGraphURL,
        async: false,
        success: function (data) {
            let edges = data.data.user.edge_owner_to_timeline_media.edges;
            endCursor = data.data.user.edge_owner_to_timeline_media.page_info.end_cursor;

            for (i = 0; i < edges.length; i++) {
                photos.push([edges[i].node.edge_media_preview_like.count, edges[i].node.edge_media_to_comment.count, edges[i].node.thumbnail_src]);
            }

            if (endCursor !== null) {
                getTopPhotos(getInstagramGraphURL(false, endCursor));
            }

            photos.sort((photoX, photoY) => {return photoY[0] - photoX[0]});
        }
    })
}

function displayProfileInfo(profileInfo, instagramHandle) {
    document.getElementById('profile-picture').setAttribute("style", "display: block")
    document.getElementById('profile-picture').src = profileInfo[0];
    document.getElementById('instagram-handle').innerHTML = instagramHandle;
    document.getElementById('posts-count').innerHTML = '<b>' + profileInfo[1] + '</b> posts';
    document.getElementById('followers-count').innerHTML = '<b>' + profileInfo[2] + '</b> followers';
    document.getElementById('following-count').innerHTML = '<b>' + profileInfo[3] + '</b> following';
    document.getElementById('full-name').innerHTML = '<b>' + profileInfo[4] + '</b>';
    document.getElementById('biography').innerHTML = profileInfo[5];
}

function displayPhotos() {
    for (i = 0; i < 9; i++) {
        document.getElementById(`photo${i}`).src = photos[i][2];
    }

    document.getElementById("loader").setAttribute("style", "display: none;");
}

function reset() {
    photos = [];

    document.getElementById('profile-picture').src = '';
    document.getElementById('instagram-handle').innerHTML = '';
    document.getElementById('posts-count').innerHTML = '';
    document.getElementById('followers-count').innerHTML = '';
    document.getElementById('following-count').innerHTML = '';
    document.getElementById('full-name').innerHTML = '';
    document.getElementById('biography').innerHTML = '';

    for (i = 0; i < 9; i++) {
        document.getElementById(`photo${i}`).src = '';
    }
}

$('#instagram-handle-search').keypress(function (e) {
    if (e.which === 13) {
        reset();
        document.getElementById("loader").setAttribute("style", "display: block;");
    }
})

$('#instagram-handle-search').keyup(function (e) {
    if (e.which === 13) {
        let instagramHandle = getInstagramHandle();

        if (instagramHandle.length == 0) {
            alert('Please enter an instagram handle!')
            document.getElementById("loader").setAttribute("style", "display: none;");
        }

        let instagramURL = getInstagramURL(instagramHandle);
        let [valid, data] = isValidUser(instagramURL);
        
        if (!valid || isPrivate(data)) {
            alert('User does not exist!')
            document.getElementById("loader").setAttribute("style", "display: none;");
        } else {
            profileInfo = getProfileInfo(data);
            profileID = getProfileID(data);
            getTopPhotos(getInstagramGraphURL(firstPage = true));
            displayProfileInfo(profileInfo, instagramHandle);
            displayPhotos();
        }
    }
});

$('img').mouseenter(function () {
    document.getElementById(this.id).style.opacity = 0.5;
}).mouseleave(function () {
    document.getElementById(this.id).style.opacity = 1.0;
});