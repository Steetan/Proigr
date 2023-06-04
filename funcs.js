//
//  funcs.js
//
// Функции и проч., применяемые на разных страницах сайта

function get_api_url() {

    // API_URL можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    if (typeof API_URL === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return API_URL;
    }
}

function get_root_domain() {

    // Домен для куки.
    // ROOT_DOMAIN можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    // Вместо этого некорректно было бы ставить window.location.host:
    // можем обращаться к page.org.com, а куку надо ставить
    // на org.com

    if (typeof ROOT_DOMAIN === 'undefined') {
        return 'blagoroda.org';
    } else {
        return ROOT_DOMAIN;
    }
}

const DOCUMENT_URL = new URL(window.location.href);
function get_parm(parm) {
        
    // Получить get parameter, уже раскодированный!
    // Если в search- строке (?a=1&b=2...) не было parm=,
    // возвращаем null.

    return DOCUMENT_URL.searchParams.get(parm);
}

function getCookie(name) {

    // Полагаю, что в куке всегда объект, его и возвращаю, если
    // в строке куки имеется преобразуемый из json объект, или
    // undefined, если кука не найдена или не преобразуется в объект

    var result = undefined;
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    if (matches) {
        var value = decodeURIComponent(matches[1]);
        if (value.match(new RegExp(`^[\"\'\`].+[\"\'\`]$`))) {
            // строка в кавычках типа:
            // "{\"provider\": \"telegram\"\054 \"user_uuid\": \"...\"\054 \"auth_token\": \"...\"}"
            value = eval (value);
        }
        try {
            result = JSON.parse(value);
        } catch (error) {
            console.log(error);
        }
    }
    return result;
}

function modal_dialog_show(html_text) {

    // Показать диалог с html_text

    $('.d-modal-close').click(function() {
        $('#dialogModal').css("display", "none");
    });
    $('#dialogText').html(html_text);
    $('#dialogModal').css("display", "block");
}


function check_auth() {

    // Проверяем, есть ли кука авторизации auth_data
    // Если есть кука, то:
    //      -   возвращаем ее объект типа:
    //          {
    //              provider: "telegram",
    //              user_uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    //              auth_token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    //          }
    //  Если нет куки авторизации, то:
    //      -   проверяем, есть ли в URL запроса параметр
    //          [?&]authdata_token=<authdata_token>
    //          -   если есть, вытаскиваем из апи по этому токену
    //              строку куки авторизации, ставим эту куку,
    //              запускаем URL, без [?&]authdata_token=<authdata_token>
    //              в get параметрах
    //          -   если нет параметра [?&]authdata_token=<authdata_token>:
    //              -   в апи получаем token для window.location.href, заодно
    //                  имя бота
    //              -   уходим на страницу телеграма для авторизации

    var result = undefined;
    if (result = getCookie('auth_data')) {
        return result;
    }
    const err_mes = 'Ошибка авторизации!'
    const api_url = get_api_url();

    var authdata_token = get_parm('authdata_token');
    if (authdata_token) {
        $.ajax({
            url: api_url  + '/api/token/authdata/?token=' + authdata_token,
            dataType: 'json',
            async: false,
            success: function(data) {
                //  - вырезать токен из адресной строки
                //  - поставить куку
                //  - уйти на window.location.href без токена
                var url = DOCUMENT_URL;
                url.searchParams.delete('authdata_token');
                var cookie_str  =
                    'auth_data=' + encodeURIComponent(JSON.stringify(data)) + ';' +
                    // 14 дней
                    'max-age=1209600; ' +
                    'path=/; ' +
                    'domain=' + get_root_domain() + '; ' +
                    'samesite=lax';
                document.cookie = cookie_str;
                window.location.assign(url.href);
            },
            error: function (error) {
                alert(err_mes);
            }
        });
    } else {
        $.ajax({
            url: api_url + '/api/token/url/',
            type: 'POST',
            data: JSON.stringify({ url: window.location.href }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: function(data) {
                if (data.bot_username) {
                    const auth_redirect_url =
                        'https://t.me/' +
                        data.bot_username +
                        '?start=auth_redirect-' + data.token
                    ;
                    const bot_url = 'https://t.me/' + data.bot_username;
                    modal_dialog_show(
                        '<p>' +
                            'Для авторизации перейдите по ссылке к телеграм-боту ' +
                            'и следуйте его указаниям. ' +
                            'Если переход по ссылке не работает ' +
                            '<a ' +
                                'href="' + auth_redirect_url + '">' +
                                'скопируйте её текст' +
                            '</a> ' +
                            '- перейдите в телеграм - и отправьте её в чат - боту ' +
                            '<a ' +
                                'href="' + bot_url + '">' +
                                bot_url +
                            '</a>' +
                        '</p>' +
                        '<p style="text-align:center">' +
                            '<a ' +
                                'href="' + auth_redirect_url + '">' +
                                '<button>Перейти</button>' +
                            '</a>' +
                        '</p>'

                    );
                    // window.location.assign(auth_redirect_url);
                } else {
                    alert(err_mes);
                }
            },
            error: function (error) {
                alert(err_mes);
            }
        });
    }
    return result;
}
