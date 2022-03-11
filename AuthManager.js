

const sessionUser = "USERMANAGER_USER";
const basePath = window.location.origin;
const MediaType = {
    APPLICATION_WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded',
    APPLICATION_JSON: 'application/json',
};
export default class AuthManager {
    static getUser() {
        const buffer = AuthManager.getCookie(sessionUser);
        return buffer ? JSON.parse(buffer) : null;
    }

    static setUser(user) {
        AuthManager.setCookie(sessionUser, JSON.stringify(user), null, window.contextPath);
    }

    static discardSession() {
        AuthManager.deleteCookie(sessionUser);
        // AuthManager.deleteCookie(REFRESH_TOKEN_COOKIE_NAME);
        window.localStorage.clear();
    }

    static isLoggedIn() {
        return !!AuthManager.getUser();
    }

    static getCookie(name) {
        name = `${name}=`;
        const arr = document.cookie.split(';');
        for (let i = 0; i < arr.length; i++) {
            let c = arr[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    static setCookie(name, value, validityPeriod, path = "/", secured = true) {
        let expires = '';
        const securedDirective = secured ? "; Secure" : "";
        if (validityPeriod) {
            const date = new Date();
            date.setTime(date.getTime() + validityPeriod * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=" + path + securedDirective;
    }

    static deleteCookie(name) {
        document.cookie = name + ' = ;path = ' + window.contextPath + '; expires = Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    static calculateExpiryTime(validityPeriod) {
        let expires = new Date();
        expires.setSeconds(expires.getSeconds() + validityPeriod);
        return expires;
    }

    static getHttpClient() {
        const client = Axios.create({
            baseURL: basePath,
            timeout: 300000,
        });
        client.defaults.headers.post['Content-Type'] = MediaType.APPLICATION_JSON;
        return client;
    }

    static logoutBase(token) {
        return AuthManager
        .getHttpClient()
        // .post(`/logout/${appContext}`, null, {
        .post(`/logout/usermanager`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    static logout() {
        return new Promise((resolve, reject) => {
            AuthManager
                .logoutBase(AuthManager.getUser().SDID)
                .then(() => {
                    AuthManager.discardSession();
                    resolve();
                })
                .catch(error => reject(error));
        });
    }
}
