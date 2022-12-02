let cur_page = 0

function setElementData(element, element_data) {
    if (element_data.id) $(element).attr("id", element_data.id)
    if (element_data.class) $(element).addClass(element_data.class)
    if (element_data.text) $(element).text(element_data.text)
    if (element_data.value) $(element).val(element_data.value)
    if (element_data.input_type) $(element).attr('type', element_data.input_type)
    if (element_data.onclick) $(element).attr('onclick', element_data.onclick)
    if (element_data.placeholder) $(element).attr('placeholder', element_data.placeholder)
    if (element_data.src) $(element).attr('src', element_data.src)
    if (element_data.href) $(element).attr('href', element_data.href)
    return element
}

function elementina(a_data, element_data) {
    var new_a = document.createElement('a')
    new_a = setElementData(new_a, a_data)

    var new_element = document.createElement(element_data.type)
    new_a.append(setElementData(new_element, element_data))

    return new_a
}

function createDivWithContents(div_data, other_elements) {
    var new_div = document.createElement('div')
    if (div_data.class) $(new_div).addClass(div_data.class)
    if (div_data.id) $(new_div).attr("id", div_data.id)

    for (var element of other_elements) {
        if (element.new_element) {
            var new_element = element.new_element
        }
        else {
            var new_element = document.createElement(element.type)
            new_element = setElementData(new_element, element)
        }
        $(new_element).appendTo(new_div)
    }

    return new_div
}

function getUsers(page) {
    $.ajax({
        url: "/api/admin/search-users",
        type: "POST",
        data: {
            username: $("#search").val(),
            limit: 10,
            page: page
        },
        success: function(data){
            var json = {data}.data
            $("#text").text(json.message)
            $("#users").children().map(function() {
                $(this).remove()
            })
            for(var user of json.users){
                var pages = user.owner_data.pages_allowed
                var card = createDivWithContents(
                    {
                        class: "card"
                    },
                    [
                        {
                            new_element: createDivWithContents(
                                {
                                    class: "section"
                                },
                                [
                                    {
                                        type: "img",
                                        src: user.profile.avatar,
                                        class: "pfp"
                                    },
                                    {
                                        new_element: createDivWithContents(
                                            {
                                                class: "column"
                                            },
                                            [
                                                {
                                                    type: "p",
                                                    class: "title",
                                                    text: "User"
                                                },
                                                {
                                                    type: "a",
                                                    class: "desc",
                                                    href: `https://dark.bio/${user._id}`,
                                                    text: `/${user._id}`
                                                }
                                            ]
                                        )
                                    },
                                    {
                                        new_element: createDivWithContents(
                                            {
                                                class: "column"
                                            },
                                            [
                                                {
                                                    type: "p",
                                                    class: "title",
                                                    text: "Owner ID"
                                                },
                                                {
                                                    type: "p",
                                                    class: "desc",
                                                    text: `${user.owner}`
                                                }
                                            ]
                                        )
                                    }
                                ]
                            )
                        },
                        {
                            type: "hr",
                            class: "divider"
                        },
                        {
                            new_element: createDivWithContents(
                                {
                                    class: "section"
                                },
                                [
                                    {
                                        new_element: createDivWithContents(
                                            {
                                                class: "column"
                                            },
                                            [
                                                {
                                                    type: "p",
                                                    class: "title",
                                                    text: "Plan"
                                                },
                                                {
                                                    type: "p",
                                                    class: "desc",
                                                    text: `${user.status.plan}`
                                                }
                                            ]
                                        )
                                    },
                                    {
                                        new_element: createDivWithContents(
                                            {
                                                class: "column"
                                            },
                                            [
                                                {
                                                    type: "p",
                                                    class: "title",
                                                    text: "Last Update"
                                                },
                                                {
                                                    type: "p",
                                                    class: "desc",
                                                    text: new Date(user.last_update_ms).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                }
                                            ]
                                        )
                                    }
                                ]
                            )
                        },
                        {
                            new_element: createDivWithContents(
                                {
                                    class: "section"
                                },
                                [
                                    {
                                        new_element: createDivWithContents(
                                            {
                                                class: "delete-container"
                                            },
                                            [
                                                {
                                                    type: "a",
                                                    class: "delete-page-and-account",
                                                    text: "Delete Account",
                                                    onclick: `deleteAccount('${user._id}')`
                                                },
                                                {
                                                    type: "a",
                                                    class: "delete-page",
                                                    text: "Delete Page",
                                                    onclick: `deletePage('${user._id}')`
                                                }
                                            ]
                                        )
                                    }
                                ]
                            )
                        },
                        {
                            new_element: createDivWithContents(
                                {
                                    class: "section"
                                },
                                [
                                    {
                                        new_element: createDivWithContents(
                                            {
                                                class: "settings-popup-button"
                                            },
                                            [
                                                {
                                                    type: "a",
                                                    class: "settings-popup",
                                                    text: "Settings",
                                                    onclick: `openPopup('${user._id}', ${pages}, '${user.status.plan}')`
                                                },
                                            ]
                                        )
                                    }
                                ]
                            )
                        }
                    ]
                )
                $("#users").append(card)
            }
        }
    })
}

function nextPage() {
    cur_page += 1
    getUsers(cur_page)
}

function lastPage() {
    cur_page -= 1
    getUsers(cur_page)
}

$(document).on('keypress',function(e) {
    if(e.which == 13) {
        cur_page = 0
        getUsers(cur_page)
    }
});

function openPopup(page, pages, plan){
    document.querySelector(".popup").style.display = "flex";
    $("#curuser").val(page)
    $("#pages").val(pages)
    $("#plans").val(plan)
    $("#give-badge").attr("onclick",`setBadge('${page}')`)
}

function deletePage(page) {
    $.ajax({
        url: "/api/admin/delete-page",
        type: "post",
        data: {
            "username": page
        },
        success: function() {
            location.reload();
        }
    })
}

function deleteAccount(page) {
    $.ajax({
        url: "/api/admin/delete-account",
        type: "post",
        data: {
            "username": page
        },
        success: function() {
            location.reload();
        }
    })
}

function setBadge(page) {
    let badges = {
      'owner': {
          class: "https://cdn.dark.bio/img/badges/owner.png",
          badge: "Owner",
          enabled: "True"
      },
      
      'verified': {
          class: "https://cdn.dark.bio/img/badges/verified.png",
          badge: "Verified",
          enabled: "True"
      },
  
      'spooky': {
          class: "https://cdn.dark.bio/img/badges/spooky.png",
          badge: "Spooky",
          enabled: "True"
      },
  
      'bug hunter': {
          class: "https://cdn.dark.bio/img/badges/bug.png",
          badge: "Bug Hunter",
          enabled: "True"
      },
  
      'contributor': {
          class: "https://cdn.dark.bio/img/badges/contributor.png",
          badge: "Contributor",
          enabled: "True"
      },
  
      'staff': {
          class: "https://cdn.dark.bio/img/badges/moderator.png",
          badge: "Staff",
          enabled: "True"
      },
  
      'early': {
          class: "https://cdn.dark.bio/img/badges/early.png",
          badge: "Early",
          enabled: "True"
      },
        
      'christmas': {
          class: "https://cdn.dark.bio/img/badges/christmas.png",
          badge: "Christmas",
          enabled: "True"
      }
    }
  
    $.ajax({
        url: "/api/admin/add-badge",
        type: "POST",
        data: {
            "username": page,
            "badge": JSON.stringify( badges[ $('#badge').val().toLowerCase() ] )
        }
    })
  
    // $.ajax({
    //     url: "/api/admin/add-badge",
    //     type: "post",
    //     data: {
    //         "username": page,
    //         "badge": badge
    //     },
    //     success: function() {
    //         location.reload();
    //     }
    // })
}

function setPlan() {
    $("#plans:selected").val();
}

$("#close").click(function() {
    $(".popup").hide()
})