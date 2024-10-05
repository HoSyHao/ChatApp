export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES ="/api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`
export const SIGNIN_ROUTE = `${AUTH_ROUTES}/signin`
export const FORGET_ROUTE = `${AUTH_ROUTES}/forgot-password`
export const RESETP_ROUTE = `${AUTH_ROUTES}/reset-password/`
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`
export const VERIFY_ROUTE = `${AUTH_ROUTES}/verify`
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`
export const UPLOAD_IMAGE_ROUTE = `${AUTH_ROUTES}/upload-image`
export const DELETE_IMAGE_ROUTE = `${AUTH_ROUTES}/remove-image`


export const CONTACTS_ROUTES ="/api/contacts";
export const SEARCH_CONTACTS_ROUTE = `${CONTACTS_ROUTES}/search`