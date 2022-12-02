async function UpdateImages() {
    var user_id = $("input[name='page-option']:checked").first().attr("id");
    if(user_id == "new-account"){
        return
    }
    
    let formData = new FormData();     

    if(background_image.files.length > 0 && $("input[name='bg-option']:checked").first().attr('id') == "image") {
        formData.append("background", background_image.files[0]);
    }else if($("input[name='bg-option']:checked").first().attr('id') == "color"){
        formData.append("background", $("#bg-col-val").val());
    }else {
        formData.append('background', null)
    }
    
    if(avatar_image.files.length > 0) {
        formData.append("avatar", avatar_image.files[0]);
    }else{
        formData.append("avatar", null);
    }

    formData.append("username", user_id);
    
    try {
        await fetch('/api/user/update-profile/images', {
            method: "POST", 
            body: formData
        });    
    } catch(err) {
        $("#toast").addClass("show")
        $("#toast .message").text(" ")
        $("#toast .message").text("Error editing Images...")
        $("#toast i").addClass("warning")
        setTimeout(function() {
        $("#toast").removeClass("show")
        }, 5400);
    }
    
    $("#toast").addClass("show")
    $("#toast .message").text(" ")
    $("#toast .message").text("Your Profile was Saved!")
    $("#toast i").addClass("success")
    setTimeout(function() {
        $("#toast").removeClass("show")
    }, 5400);
}

async function UpdateProfile() {
    var user_id = $("input[name='page-option']:checked").first().attr("id");
    if(user_id == "new-account"){
        return
    }
                                
    var name_color = $("#name-color-1").val()
    var activity_color = $("#activity-color-1").val()
    var bio_color = $("#bio-color-1").val()
    var container_type = $("input[name='profile-container-option']:checked").first().attr("id")
    var container_color = $("#profile-container-color").val()
    if(container_type == "profile-container-transparent-option"){
        var container_color = null;
    }

    var display_name = $("#username").val()
    var activity = $("#activity").val()
    var bio = $("#bio").val()

    var links = $("#links-list").children().map(function() {
        return {
            name: $(this).find("#link-name").val(),
            url: $(this).find("#link-url").val(),
            color: $(this).find("#background-color").val(),
            accent: $(this).find("#text-color").val(),
            full_row: $(this).find("#fullrow").is(":checked"),
            highlight: $(this).find("#highlight").is(":checked")
        }
    }).get()
    links.pop()

    var payload = {
        username:user_id,
        name_color: name_color,
        activity_color: activity_color,
        bio_color: bio_color,
        display_name: display_name,
        container_color: container_color,
        activity: activity,
        bio: bio,
        font: $("input[name='font-option']:checked").first().attr("id"),
        links:links
    }

    if($("#name-gradient").is(":checked")) {
        payload.secondary_name_color = $("#name-color-2").val()
    }
    if($("#activity-gradient").is(":checked")) {
        payload.secondary_activity_color = $("#activity-color-2").val()
    }
    if($("#bio-gradient").is(":checked")) {
        payload.secondary_bio_color = $("#bio-color-2").val()
    }
    
    $.ajax({
        url:`/api/user/update-profile/display`,
        type:"POST",
        dataType:"json",
        
        data:{"data": JSON.stringify(payload)},
        success:async function(response) {
            $("#toast").addClass("show")
                $("#toast .message").text(" ")
                $("#toast .message").text("Your Profile was Saved!")
                $("#toast i").addClass("success")
                setTimeout(function() {
                    $("#toast").removeClass("show")
                }, 5400);
            await refreshUser()
            return 
        },
        error:async function(response){ 
            if(response.status == 200) return 
                $("#toast").addClass("show")
                $("#toast .message").text(" ")
                $("#toast .message").text("Your Profile was Saved!")
                $("#toast i").addClass("success")
                setTimeout(function() {
                    $("#toast").removeClass("show")
                }, 5400);
            await refreshUser(); 
            $("#toast").addClass("show")
                $("#toast .message").text(" ")
                $("#toast .message").text("Something went Wrong...")
                $("#toast i").addClass("warning")
                setTimeout(function() {
                    $("#toast").removeClass("show")
                }, 5400)
            return
        }

    });

    await UpdateImages()
}

function createPage() {
    $("#notif").css("color", "#fe9a9a")
    var username = $('#new-username').val();
    $.ajax({
        url:"/api/user/create-page",
        type:"POST",

        data:{
            username:username
        },
        success:function(response) {
            $("#notif").css("color", "#9afe9a")
            $("#notif").text("Page created")
            setTimeout(() => { location.reload(); }, 100);
            return 
        },
        error:function(response){ 
            $("#toast").addClass("show")
            $("#toast .message").text(" ")
            $("#toast .message").text($.parseJSON(response.responseText).message)
            $("#toast i").addClass("warning")
            setTimeout(function() {
                $("#toast").removeClass("show")
            }, 5400)
            return
        }

    });
}

function changeUsername() {
    var user_id = $("input[name='page-option']:checked").first().attr("id");
    if(user_id == "new-account"){
        return
    }
    $("#notif").css("color", "#fe9a9a")
    var username = $('#change-username').val();
    $.ajax({
        url:"/api/user/change-username",
        type:"POST",

        data:{
            username:user_id,
            newusername:username
        },
        success:function(response) {
            $("#notif").css("color", "#9afe9a")
            $("#notif").text("Page created")
            setTimeout(() => { location.reload(); }, 100);
            return 
        },
        error:function(response){ 
            $("#toast").addClass("show")
            $("#toast .message").text(" ")
            $("#toast .message").text($.parseJSON(response.responseText).message)
            $("#toast i").addClass("warning")
            setTimeout(function() {
                $("#toast").removeClass("show")
            }, 5400)
            return
        }

    });
}

function deletePage() {
    var user_id = $("input[name='page-option']:checked").first().attr("id");
    if(user_id == "new-account"){
        return
    }
    $("#notif").css("color", "#fe9a9a")
    $.ajax({
        url:"/api/user/delete-page",
        type:"POST",

        data:{
            username:user_id
        },
        success:function(response) {
            $("#notif").css("color", "#9afe9a")
            $("#notif").text("Page deleted")
            setTimeout(() => { location.reload(); }, 100);
            return 
        },
        error:function(response){ 
            $("#toast").addClass("show")
            $("#toast .message").text(" ")
            $("#toast .message").text($.parseJSON(response.responseText).message)
            $("#toast i").addClass("warning")
            setTimeout(function() {
                $("#toast").removeClass("show")
            }, 5400)
        }

    });
}