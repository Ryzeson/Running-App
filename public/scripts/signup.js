function checkPasswords() {
    var password = $('input[name="password"]').val();
    var confirmPassword = $('input[name="confirm-password"]').val();
    if (password != confirmPassword) {
        $('input[name="submit"]').prop("disabled", true);
        $('input[name="submit"]').addClass("disabled");
        $('#passwords-not-match-text').removeClass("hidden");
    }
    else {
        $('input[name="submit"]').prop("disabled", false);
        $('input[name="submit"]').removeClass("disabled");
        $('#passwords-not-match-text').addClass("hidden");
    }
}

$(window).on("keyup", e => {
    checkPasswords();
})