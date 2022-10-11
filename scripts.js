
$(function() {
    //Get 
    $('#get-button').on('click', function() {
        $.get('/tweets', function (data) {
            $('#namebody tr').remove(); // clear the table
            let content = '';
            for (let user of data) {
                content += `<tr><td>${user.id}</td><td>${user.screen_name}</td><td>${user.name}</td></tr>`;
            }
            $('#namebody').append(content);
        })
    });


    //Get tweets
    $('#get-tweets-button').on('click', function(){
        $.get('/tweetinfo', function (data) {
            $('#tweetbody tr').remove();
            let content = '';
            for (let tweet of data) {
                content += `<tr><td>${tweet.id}</td><td>${tweet.text}</td><td>${tweet.created_at}</td></tr>`;
            }
            $('#tweetbody').append(content);
        })
    });

    //Get searched tweets
    $('#get-searched-tweets').on('click', function() {
        $.get('/searchinfo', function (data) {
            $('#searchbody tr').remove();
            if (data === 'OK') return; // we've not searched for anything
            $('#searchbody').append(`<tr><td>${data.id}</td><td>${data.text}</td><td>${data.created_at}</td></tr>`);
        })
    });


    //CREATE
    $('#create-form').on('submit', function(event){
        event.preventDefault();

        let createInput = $('#create-input').val().split(';');
        if (!createInput.length === 2) return;

        $.ajax({
            url: '/tweetinfo',
            type: 'POST',
            data: JSON.stringify({ id: createInput[0], text: createInput[1] }),
            contentType: 'application/json'
        })
    });

    //Create searched tweets
    $('#search-form').on('submit', function(event){
        event.preventDefault();
        var userID = $('#search-input');
    
        $.ajax({
            url: '/searchinfo',
            type: 'POST',
            data: JSON.stringify({ id: userID.val() }),
            contentType: 'application/json',
            success: function (data) {
                $('#searchbody tr').remove();
                if (data === 'OK') return; // nothing found :/
                $('#searchbody').append(`<tr><td>${data.id}</td><td>${data.text}</td><td>${data.created_at}</td></tr>`);
            }
        });
    });

    //UPDATE/PUT
    $("#update-user").on('submit', function(event){
        event.preventDefault();
        var updateInput = $('#update-input');
        var inputString = updateInput.val();
        
        const parsedStrings = inputString.split(';');
        
        var name = parsedStrings[0];
        var newName = parsedStrings[1];
        
        $.ajax({
            url: '/tweets/' + name,
            type: 'PUT',
            data: JSON.stringify({ screen_name: newName }),
            contentType: 'application/json'
        });

    });


    //DELETE
    $("#delete-form").on('submit', function(event) {
        var id = $('#delete-input').val();
        event.preventDefault();
        
        $.ajax({
            url: '/tweetinfo/' + id,
            type: 'DELETE'
        });
    });


});

function test_print(){

    console.log("test code")

}
                    
   