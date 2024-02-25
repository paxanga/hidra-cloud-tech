function _validateEmailField($value) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test($value)) {
        return false;
    }

    return true;
}

function _validateURLField($value) {
    var urlRegex = /^(http|https):\/\/[^ "]+$/;

    if (!urlRegex.test($value)) {
        return false;
    }

    return true;
}