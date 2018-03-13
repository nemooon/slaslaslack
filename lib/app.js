'use strict';

var _workspace = require('../lib/workspace');

var _workspace2 = _interopRequireDefault(_workspace);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const query = _queryString2.default.parse(location.search);

window.jQuery = window.$ = require('jquery');
const config = require(query.home + '/.slaslaslack/config.json');

let i,
    max_workspace_length = 1;

const $stream = $('#stream'),
      $stream_table = $('#stream_table'),
      $template_message = $('#template_message');

function scrollBottom() {
    $stream.animate({ scrollTop: $stream.prop("scrollHeight") }, 2000);
}

function addLog(msg) {

    let $tr = $('<tr>').attr('class', 'log'),
        $td1 = $('<td>'),
        $td2 = $('<td>');

    $td1.text(msg.workspace);
    $td2.text(msg.message);

    $tr.append($td1);
    $tr.append($td2);

    $stream_table.append($tr);

    scrollBottom();
}

function addMessage(msg) {

    let $tr = $('<tr>').attr('class', 'message'),
        $td1 = $('<td>'),
        $td2 = $('<td>');

    $td1.text(msg.workspace);

    let $message = $template_message.clone(false);

    $td2.append($message);

    if (msg.user.profile.image_32) {
        $message.find('.profile').attr('src', msg.user.profile.image_32);
    } else {
        $message.find('.profile').attr('src', 'https://dummyimage.com/36x36/AAA/AAA.png');
    }

    $message.find('.channel').html(msg.channel);
    $message.find('.name').html('@' + msg.user.profile.display_name);
    $message.find('.date').html(msg.time);
    $message.find('.message').html(msg.message);

    $tr.append($td1);
    $tr.append($td2);

    $stream_table.append($tr);

    scrollBottom();
}

$(function () {

    const $link = $('<link>').attr({
        rel: 'stylesheet',
        href: query.home + '/.slaslaslack/style.css'
    });
    $('body').append($link);

    for (i = 0; i < config.length; i++) {
        if (max_workspace_length < config[i].name.length) {
            max_workspace_length = config[i].name.length;
        }
    }
    for (i = 0; i < config.length; i++) {
        new _workspace2.default(config[i].token, i, max_workspace_length).on('LOG', addLog).on('MESSAGE', addMessage).start();
    }
});