async function checkLogin() {
    if($("#password").val() != "" && $("#email").val() != "" && $("#email").val().includes("@") && $("#email").val().includes(".")){
        $("#notif").css("color", "")
        $("#notif").text("")
        $("#login-button").css("pointer-events", "")
        return true
    }else {
        $("#notif").css("color", "#fe9a9a")
        $("#notif").text("You're missing some information")
        $("#login-button").css("pointer-events", "")
    }
    return false
}

async function login() {
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
    if(!await checkLogin()){
        return
    }
    var email = $('#email').val();
    var password = $('#password').val();
    try{
        $.ajax({
            url:"/login",
            type:"POST",
    
            data:{
                email:email,
                password:password,
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
                $("#login-button").css("pointer-events", "")
                turnstile.reset()
                return
            }
    
        });
    }catch(_) {
        $("#notif").css("color", "#fe9a9a")
        $("#notif").text("Captcha not loaded, retry in a couple of seconds")
        $("#login-button").css("pointer-events", "")
    }
}