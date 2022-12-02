async function checkRegister() {
    if($("#password").val() == $("#password2").val() && $("#password").val() != "" && $("#email").val() != "" && $("#email").val().includes("@") && $("#email").val().includes(".")){
        $("#notif").css("color", "")
        $("#notif").text("")
        $("#register-button").css("pointer-events", "")
        return true
    }else if($("#password").val() != $("#password2").val()) {
        $("#notif").css("color", "#fe9a9a")
        $("#notif").text("Passwords do not match")
        $("#register-button").css("pointer-events", "")
    }else {
        $("#notif").css("color", "#fe9a9a")
        $("#notif").text("You're missing some information")
        $("#register-button").css("pointer-events", "")
    }
    return false
}

async function register() {
    if(turnstile.getResponse() == null){
        try{
            turnstile.reset()
        }catch(_){
            $("#turnstile").children().map(function(){
                return $(this).remove()
            })
            turnstile.render('#turnstile', {
                sitekey: '0x4AAAAAAAAtdF5nsNHEAsij',
                theme: 'dark',
            });
        }
    }
    if(!await checkRegister()){
        return
    }
    var username = $('#username').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var password2 = $('#password2').val();

    let accepted = $('.input-checkbox').is(':checked')
    if (!accepted) {
      $("#notif").css("color", "#fe9a9a")
      $("#notif").text("You did not accept our terms of service!")
      $("#register-button").css("pointer-events", "")
      return
    }
  
    try {
        $.ajax({
            url:"/register",
            type:"POST",
    
            data:{
                username:username,
                email:email,
                password:password,
                password2:password2,
                captcha:turnstile.getResponse()
            },
            success:function(response) {
                $("#notif").css("color", "#9afe9a")
                $("#notif").text("Logged in")
                setTimeout(() => { location.reload(); }, 100);
                return 
            },
            error:function(response){ 
                $("#notif").css("color", "#fe9a9a")
                $("#notif").text(JSON.parse(response.responseText)["message"])
                $("#register-button").css("pointer-events", "")
                turnstile.reset()
                return
            }
    
        });
    }catch(_) {
        $("#notif").css("color", "#fe9a9a")
        $("#notif").text("Captcha not loaded, retry in a couple of seconds")
        $("#register-button").css("pointer-events", "")
    }
}