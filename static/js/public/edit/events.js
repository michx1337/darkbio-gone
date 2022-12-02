$(".settings-icon").click(function() {
    if ($(".settings-container").is(":visible")) return $(".settings-container").hide()
    $(".settings-container").show()
    $(".delete-container").hide()
    $(".background-container").hide()
})

$(".delete-icon").click(function() {
    if ($(".delete-container").is(":visible")) return $(".delete-container").hide()
    $(".delete-container").show()
    $(".settings-container").hide()
    $(".background-container").hide()
})

$(".background-icon").click(function() {
    if ($(".background-container").is(":visible")) return $(".background-container").hide()
    $(".background-container").show()
    $(".delete-container").hide()
    $(".settings-container").hide()
})

 // $('#bio').on('input', function() {this.style.height = '35px';this.style.height = (this.scrollHeight + 2) + 'px';});

//$('.profile-color').on('input', function() {
    //$(this).siblings().first().css("color", $(this).val()).css("border-color", $(this).val())
    //if(this.id == "name-color") $(".badges").css("color", $(this).val()).css("border-color", $(this).val())
//})

$(document).on('input', '.profile-color', function() {
    if (this.id == "background-color") $(this).closest("a[id='card-item']").css("background-color", $(this).val())
    if (this.id == "text-color") $(this).closest("a[id='card-item']").css("color", $(this).val())
})

$(document).on('input', '.slider-input', function() {
    if (this.id == "fullrow") {
        if($(this).is(":checked")) return $(this).closest("a[id='card-item']").addClass("item-full").removeClass("item")
        $(this).closest("a[id='card-item']").removeClass("item-full").addClass("item")
    }
    if (this.id == "highlight") {
        if($(this).is(":checked")) return $(this).closest("a[id='card-item']").css("animation", "pulse 3s infinite")
        $(this).closest("a[id='card-item']").css("animation", "none")
    }
})

$("#background-choices input").change(function() {
    if (this.id == "image") {
        $("#background-image-dropzone").css("display", "")
        $("#bg-col-val").css("display", "none")
    } else {
        $("#background-image-dropzone").css("display", "none")
        $("#bg-col-val").css("display", "")
    }
});

// name color
$("#name-color-choices input").change(function() {
    if (this.id == "name-color") {
        $("#name-color-1").css("display", "")
        $("#name-color-2").css("display", "none")
        $("#name-primary").css("display", "")
        $("#name-secondary").css("display", "none")
    } else {
        $("#name-color-1").css("display", "")
        $("#name-color-2").css("display", "")
        $("#name-primary").css("display", "")
        $("#name-secondary").css("display", "")
    }
});

// activity color 
$("#activity-color-choices input").change(function() {
    if (this.id == "activity-color") {
        $("#activity-color-1").css("display", "")
        $("#activity-color-2").css("display", "none")
        $("#activity-primary").css("display", "")
        $("#activity-secondary").css("display", "none")
    } else {
        $("#activity-color-1").css("display", "")
        $("#activity-color-2").css("display", "")
        $("#activity-primary").css("display", "")
        $("#activity-secondary").css("display", "")
    }
});

// bio color 
$("#bio-color-choices input").change(function() {
    if (this.id == "bio-color") {
        $("#bio-color-1").css("display", "")
        $("#bio-color-2").css("display", "none")
        $("#bio-primary").css("display", "")
        $("#bio-secondary").css("display", "none")
    } else {
        $("#bio-color-1").css("display", "")
        $("#bio-color-2").css("display", "")
        $("#bio-primary").css("display", "")
        $("#bio-secondary").css("display", "")
    }
});

$("#profile-container-choices input").change(function() {
    if (this.id == "profile-container-color-option") {
        $("#profile-container-color").css("display", "")
        $("#profile-container-dropzone").css("display", "none")
    } else if (this.id == "profile-container-image-option") {
        $("#profile-container-color").css("display", "none")
        $("#profile-container-dropzone").css("display", "")
    } else if (this.id == "profile-container-transparent-option") {
        $("#profile-container-color").css("display", "none")
        $("#profile-container-dropzone").css("display", "none")
    }
});


$("#bg-col").on("input", function() {
    document.getElementById("main-body").style.backgroundImage = "none";
    $("#main-body").css("background-color", $("#bg-col-val").val())
})

$(".font-option").on("input", function() {
    $("#main-body").removeClass("poppins montserrat chillax trebuchet sora comic-sans").addClass(this.id)
})

async function refreshUser() {
    var user_id = $("input[name='page-option']:checked").first().attr("id");
    if(user_id == "new-account"){
        return
    } 
    $("#username").val(user_id)
    
    $.getJSON(`/api/user/profile-all/check/${user_id}`, async function(data) {
        var theme = data.theme
        var font = data.font
        var bio = data.bio
        var display_name = data.display_name
        if(display_name) $("#username").val(display_name)
        else {$("#username").val(user_id)}
        var activity = data.activity

        var name_color = data.colors.name
        var bio_color = data.colors.bio
        var activity_color = data.colors.activity

        var links = data.links
        var background = data.background
        var background_type = data.background_type
        var avatar = data.avatar
        
        var badges = data.badges

        $(`#${font}`).prop("checked", true)

        $(`#main-body`).removeClass("chillax").removeClass("poppins").removeClass("montserrat").removeClass("trebuchet").removeClass("sora").removeClass("comic-sans").addClass(font)
        $("#main-body").css("background-image", "")
        
        $(`#bio`).val(bio)
        $(`#activity`).val(activity)
        $(`#display_name`).val(display_name)

        $("#name-color-1").val(name_color)
        //$("#name-color-1").siblings().first().css("color", $("#name-color-1").val()).css("border-color", $("#name-color-1").val())
        //$(".badges").css("color", $("#name-color").val()).css("border-color", $("#name-color").val())
        $("#bio-color-1").val(bio_color)
        //$("#bio-color-1").siblings().first().css("color", $("#bio-color-1").val()).css("border-color", $("#bio-color-1").val())
        $("#activity-color-1").val(activity_color)
        //$("#activity-color-1").siblings().first().css("color", $("#activity-color-1").val()).css("border-color", $("#activity-color-1").val())

        $("#view-page").attr("onclick", `location.href='/${user_id}'`)
        
        $("#links-list").children().map(function() {
            if(this.id != "add-link") $(this).remove()
        })

        $("#badges").children().map(function() {
            if(this.id != "add-badge") $(this).remove()
        })
        
        for(var link of links){
            var new_link = addLink()
            $(new_link).find("#link-url").val(link.url)
            $(new_link).find("#link-name").val(link.name)
            $(new_link).find("#name").text(link.name)
            $(new_link).find("#background-color").val(link.color)
            $(new_link).find("#text-color").val(link.accent)
            $(new_link).css("background-color", $(new_link).find("#background-color").val())
            $(new_link).css("color", $(new_link).find("#text-color").val())
            $(new_link).find("#highlight").prop("checked", link.highlight)
            $(new_link).find("#fullrow").prop("checked", link.full_row)
            
            if($(new_link).find("#fullrow").is(":checked")) {
                $(new_link).find("#fullrow").closest("a[id='card-item']").addClass("item-full").removeClass("item")
            } else {
                $(new_link).find("#fullrow").closest("a[id='card-item']").removeClass("item-full").addClass("item")
            }
            if($(new_link).find("#highlight").is(":checked")) {
                $(new_link).find("#highlight").closest("a[id='card-item']").css("animation", "pulse 3s infinite")
            }
            else {
                $(new_link).find("#highlight").closest("a[id='card-item']").css("animation", "none")
            }
        }

        for(var badge of badges){
            if(badge["enabled"]) {
                var b = document.createElement("i")
                $(b).addClass(badge["class"])
                $(b).attr("title", badge['badge'])
                $(b).appendTo("#badges")
            }
        }

        if(background_type == "image") {
            $("#image").prop("checked", true)
            document.getElementById("main-body").style.backgroundImage = `url('${background}')`;
        }else if(background_type == "color") {
            $("#color").prop("checked", true)
            $("#bg-col-val").val(background)
            $("#main-body").css("background-color", $("#bg-col-val").val())
        }else {
            $("#color").prop("checked", true)
            document.getElementById("main-body").style.backgroundImage = `none`;
            $("#bg-col-val").val("#111111")
            $("#main-body").css("background-color", $("#bg-col-val").val())
        }
        
        if(avatar != "") {
            $("#avatar").attr('src', avatar)
        }else {
            $("#avatar").attr("src", "https://cdn.dark.bio/img/site/default_avatar.jpg")
        }

    })
    if($("#profile-container").children().last().prop("tagName") == "DIV") {
        $("#profile-container").children().last().remove()
        $("#avatar_image").val('');
        let img = document.createElement('img')
        $(img).attr("src", "https://cdn.dark.bio/img/site/default_avatar.jpg").addClass("profile-card-img drop-zone-prompt")
        $(img).prependTo("#profile-container")
    } 
}

$(document).ready(async function() {
    await refreshUser()
})

$("input[name='page-option']").on("input", async function() {
    var user_id = $("input[name='page-option']:checked").first().attr("id");
    if(user_id == "new-account"){
        return $("#create-page").css("display", "")
    }
    $("#create-page").css("display", "none")
    await refreshUser()
})

function displayBadge(badge){
    if($(badge).css("display") == "none") return $(badge).css("display", "")
    $(badge).css("display", "none")
}

function openPopup(page, owner){
    document.querySelector(".popup").style.display = "flex";
    $(document.querySelector(".popup")).attr("name", page)
    $(document.querySelector(".popup")).attr("id", owner)
}

function openColorPopup(){
    document.querySelector(".colorpopup").style.display = "flex";
    $(document.querySelector(".colorpopup")).attr("name", page)
    $(document.querySelector(".colorpopup")).attr("id", owner)
}

$("#close").click(function() {
$(".popup").hide()
})

$("#closecolorpopup").click(function() {
$(".colorpopup").hide()
})