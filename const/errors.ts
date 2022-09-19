export const ERRORS = {
    MONGO: {
        CODE_ERROR: "E11000",
        AUTH_FAILED: "Auth validation failed",
        DUPLICATE_USERNAME_EMAIL: "Username or Email are already used",
        BAD_LOGIN: "Username or Password are not correct"
    },
    EMAIL: {
        invalidLink: "The reset link is not valid"
    },
    USER: {
        notFound: "User not found"
    },
    SHIFT: {
        noShifts: "There are no shifts created",
        notFound: "Shift not found"
    },
    COMMENT: {
        noComments: "There are no comments created",
        notFound: "Comment not found"
    }
}