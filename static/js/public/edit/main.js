const dragArea = document.getElementById('links-list');
new Sortable.create(dragArea, {
    animation: 400,
    handle: ".handler",
    filter: ".add-link",
    easing: "cubic-bezier(0, .5, .5, 1)",
    onMove(e) {
        return e.related.className.indexOf('add-link') === -1;
    }
});

function setElementData(element, element_data) {
    if (element_data.id) $(element).attr("id", element_data.id)
    if (element_data.class) $(element).addClass(element_data.class)
    if (element_data.text) $(element).text(element_data.text)
    if (element_data.value) $(element).val(element_data.value)
    if (element_data.input_type) $(element).attr('type', element_data.input_type)
    if (element_data.onclick) $(element).attr('onclick', element_data.onclick)
    if (element_data.placeholder) $(element).attr('placeholder', element_data.placeholder)
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

function addLink() {

    if ($("#links-list").children().length > 50 && $("#add-link").is(":visible")) {
        $("#add-link").hide()
        return
    }

    let redirect = document.createElement("a");
    $(redirect).css("color", "inherit")
    $(redirect).css("text-decoration", "none")
    $(redirect).addClass("card item flex-col")
    $(redirect).attr('id', 'card-item')

    var top_card = createDivWithContents({
        class: 'top-card'
    },
        [
            {
                new_element: createDivWithContents(
                    { class: 'link-left' },
                    [
                        {
                            type: 'i',
                            class: 'fa-solid fa-moon',
                            id: 'link-icon'
                        },
                        {
                            type: 'input',
                            input_type: 'text',
                            value: `New link ${$("#links-list").children().length}`,
                            id: 'link-name',
                            placeholder: 'Link Name',
                        }
                    ]
                )
            },
            {
                new_element: elementina(
                    {
                        class: 'icon-container nostyle-a mr',
                        onclick: 'openSettings(this)'
                    },
                    {
                        type: 'i',
                        class: 'fa-solid fa-gear'
                    }
                )
            },
            {
                type: 'i',
                class: 'icon-container fa-solid fa-grip-vertical handler'
            }
        ]
    )
    redirect.append(top_card)

    var bottom_card = createDivWithContents({
        class: 'bottom-card gap-tn',
        id: 'bottom-card'
    },
        [
            {
                new_element: createDivWithContents(
                    {
                        class: 'text-input-container flex-col gap-tn'
                    },
                    [
                        {
                            type: 'input',
                            input_type: 'text',
                            class: 'text-input',
                            placeholder: 'URL',
                            value: "https://",
                            id: "link-url"
                        },
                    ]
                )
            }, 
            {
                new_element: createDivWithContents(
                    {
                        class: 'color-input-container'
                    },
                    [
                        {
                            type: 'input',
                            input_type: 'color',
                            class: 'profile-color',
                            value: "#222222",
                            id: "background-color"
                        },
                        {
                            type: 'p',
                            text: "Background"
                        }
                    ]
                )
            },
            {
                new_element: createDivWithContents(
                    {
                        class: 'color-input-container'
                    },
                    [
                        {
                            type: 'input',
                            input_type: 'color',
                            class: 'profile-color',
                            value: "#DDDDDD",
                            id: "text-color"
                        },
                        {
                            type: 'p',
                            text: "Text"
                        }
                    ]
                )
            },
            {
                new_element: createDivWithContents(
                    {
                        class: 'color-input-container'
                    },
                    [
                        {
                            type: 'input',
                            input_type: 'checkbox',
                            class: 'slider-input',
                            id: "fullrow"
                        },
                        {
                            type: 'p',
                            text: "Full Row"
                        }
                    ]
                )
            },
            {
                new_element: createDivWithContents(
                    {
                        class: 'color-input-container'
                    },
                    [
                        {
                            type: 'input',
                            input_type: 'checkbox',
                            class: 'slider-input',
                            id: "highlight"
                        },
                        {
                            type: 'p',
                            text: "Highlight"
                        }
                    ]
                )
            },
            {
                type: 'a',
                onclick: 'deleteLink(this)',
                class: 'link-button delete-button',
                text: 'Delete'
            }
        ]
    )
    redirect.append(bottom_card)

    document.getElementById("links-list").insertBefore(redirect, document.getElementById("add-link"));

    if ($("#links-list").children().length > 50 && $("#add-link").is(":visible")) {
        $("#add-link").hide()
    }

    return redirect
}

function openSettings(element) {
    let bottom_card = $($(element).parents().closest("a[id='card-item']")).children().last()
    if ($(bottom_card).hasClass("bottom-open")) {
        $(element).removeClass("rotate")
        $(bottom_card).removeClass("bottom-open")
    }
    else {
        $(bottom_card).addClass("bottom-open")
        $(element).addClass("rotate")
    }
}

function deleteLink(element) {
    $("#add-link").show()
    $(element).parents().closest("a[id='card-item']").remove()
}

document.querySelectorAll(".drop-zone-input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone-over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone-over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone-over");
    });
});

function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone-thumb");

    if (dropZoneElement.querySelector(".drop-zone-prompt")) {
        dropZoneElement.querySelector(".drop-zone-prompt").remove();
    }

    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone-thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            if($(dropZoneElement).children().first().attr("name") == "background") {
                document.getElementById("main-body").style.backgroundImage = `url('${reader.result}')`;
            }
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}

function openBadges() {
    if($("#badge-edit").css("display") == "none") return $("#badge-edit").css("display", "")
    $("#badge-edit").css("display", "none")
}

function deletePageConfirm() {
    if($(".deletepageconfirm").css("display") == "none") return $(".deletepageconfirm").css("display", "flex")
    $(".deletepageconfirm").css("display", "none")
}

function openAllSettings() {
    if($(".settingsbottom").css("display") == "none") return $(".settingsbottom").css("display", "flex")
    $(".settingsbottom").css("display", "none")

}