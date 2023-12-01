function checkPasswords() {
    console.log("checking password");
    var password = $('input[name="password"]').val();
    var confirmPassword = $('input[name="confirm-password"]').val();
    if (password != confirmPassword) {
        $('input[name="submit"]').prop("disabled", true);
        if ($('#passwords-not-match-text').hasClass("hidden")) {
            $('#passwords-not-match-text').toggleClass("hidden");
        }
    }
    else {
        $('input[name="submit"]').prop("disabled", false);
        if (!$('#passwords-not-match-text').hasClass("hidden")){
            $('#passwords-not-match-text').toggleClass("hidden");
        }
    }
}

$(window).on("keyup", e => {
    checkPasswords();
})