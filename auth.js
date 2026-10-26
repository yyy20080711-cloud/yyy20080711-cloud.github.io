(function () {
    'use strict';

    var USERS_KEY = 'yyy_site_users';
    var SESSION_KEY = 'yyy_site_session';
    var SALT = 'yyy-portfolio-auth-v1';

    function getUsers() {
        try {
            var raw = localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getSession() {
        try {
            var raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setSession(username) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            username: username,
            loginAt: Date.now()
        }));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function sha256(text) {
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
            return Array.from(new Uint8Array(buf)).map(function (b) {
                return b.toString(16).padStart(2, '0');
            }).join('');
        });
    }

    function hashPassword(username, password) {
        return sha256(SALT + ':' + username.toLowerCase() + ':' + password);
    }

    function validateUsername(username) {
        if (!username || username.length < 3 || username.length > 20) {
            return '用户名需要 3 到 20 个字符';
        }
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) {
            return '用户名仅支持中文、字母、数字和下划线';
        }
        return '';
    }

    function validatePassword(password) {
        if (!password || password.length < 6) {
            return '密码至少 6 位';
        }
        if (password.length > 64) {
            return '密码最长 64 位';
        }
        return '';
    }

    function register(username, password, confirm) {
        var nameError = validateUsername(username);
        if (nameError) {
            return Promise.resolve({ ok: false, message: nameError });
        }
        var passError = validatePassword(password);
        if (passError) {
            return Promise.resolve({ ok: false, message: passError });
        }
        if (password !== confirm) {
            return Promise.resolve({ ok: false, message: '两次输入的密码不一致' });
        }

        var users = getUsers();
        var exists = users.some(function (u) {
            return u.username.toLowerCase() === username.toLowerCase();
        });
        if (exists) {
            return Promise.resolve({ ok: false, message: '该用户名已被注册' });
        }

        return hashPassword(username, password).then(function (hash) {
            users.push({
                username: username,
                passwordHash: hash,
                createdAt: Date.now()
            });
            saveUsers(users);
            setSession(username);
            return { ok: true, message: '注册成功，已自动登录' };
        });
    }

    function login(username, password) {
        if (!username || !password) {
            return Promise.resolve({ ok: false, message: '请输入用户名和密码' });
        }

        var users = getUsers();
        var user = users.find(function (u) {
            return u.username.toLowerCase() === username.toLowerCase();
        });
        if (!user) {
            return Promise.resolve({ ok: false, message: '用户名或密码不正确' });
        }

        return hashPassword(username, password).then(function (hash) {
            if (hash !== user.passwordHash) {
                return { ok: false, message: '用户名或密码不正确' };
            }
            setSession(user.username);
            return { ok: true, message: '登录成功' };
        });
    }

    function renderNav() {
        var host = document.getElementById('navAuth');
        if (!host) return;

        var session = getSession();
        var loginLink = document.getElementById('authNavLink');
        if (session && session.username) {
            if (loginLink) loginLink.style.display = 'none';
            host.innerHTML =
                '<span class="nav-user" title="当前登录用户">' +
                '<i class="fas fa-user" aria-hidden="true"></i>' +
                '<span>' + session.username + '</span>' +
                '</span>' +
                '<button type="button" class="nav-logout" id="authLogoutBtn">退出</button>';
            var btn = document.getElementById('authLogoutBtn');
            if (btn) {
                btn.addEventListener('click', function () {
                    clearSession();
                    window.location.href = 'auth.html';
                });
            }
        } else {
            host.innerHTML = '';
            if (loginLink) loginLink.style.display = '';
        }
    }

    window.SiteAuth = {
        getSession: getSession,
        logout: clearSession,
        register: register,
        login: login,
        renderNav: renderNav,
        validateUsername: validateUsername,
        validatePassword: validatePassword
    };

    document.addEventListener('DOMContentLoaded', renderNav);
})();
