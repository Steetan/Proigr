// Это все нужно для настройки проигрывателя
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    videoId: localStorage.getItem('href'), // сюда вставляется ссылка, переданная по урл
    events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}
function onPlayerReady(event) {
    event.target.playVideo();
}
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
    done = true;
    }
}
function stopVideo() {
    player.stopVideo();
}
//============================================================


const btn = document.querySelectorAll(".btn") //ищем все кнопки
const table = document.querySelector(".table") //ищем таблицу
let date
let day
let month
let year
let hours
let minutes
let seconds

setInterval(() => { // нужен для обновления даты
    date = new Date()  //получаем дату
    day = date.getDate() //получаем день
    month = date.getMonth() //получаем месяц
    year = date.getFullYear() //получаем год
    hours = date.getHours() //получаем часы
    minutes = date.getMinutes() //получаем минуты
    seconds = date.getSeconds() //получаем секунды
    
    //Добавляем нули к числам если они меньше 10
    if(day < 10) {
        day = "0" + day
    }
    if(month < 10) {
        month = "0" + (month + 1)
    }
    if(hours < 10) {
        hours = "0" + hours
    }
    if(minutes < 10) {
        minutes = "0" + minutes
    }
    if(seconds < 10) {
        seconds = "0" + seconds
    }
}, 500);


btn.forEach(function(event) {  // ставим на все кнопки прослушки
    event.addEventListener("click", function() { // если мы нажали на эту кнопку то..
        let trTable = document.createElement("tr") // создаем элемент tr
        let tdTable = document.createElement("td") // создаем элемент td
        let td2Table = document.createElement("td") // создаем элемент td
        let td3Table = document.createElement("td") // создаем элемент td

        let timeVideoSeconds = player.getCurrentTime() //получаем время остановы в секундах
        let timeVideo
        let playerSeconds
        let playerMinutes
        let playerHours

        // Раскладываем полученные из видео секунды на часы, минуты и секунды
        playerHours = Math.floor(timeVideoSeconds / 60 / 60)
        playerMinutes = Math.floor((timeVideoSeconds / 60) - (playerHours * 60))
        playerSeconds = Math.floor(timeVideoSeconds % 60)

        // если секунды меньше десяти то добавляем 0
        if (playerSeconds < 10) {
            playerSeconds = "0" + playerSeconds
        }
        timeVideo = `${playerMinutes}:${playerSeconds}` //засовываем в общую переменную
        
        // если останова имеет часы то отображаем их
        if (playerHours > 0) {
            timeVideo = `${playerHours}:${playerMinutes}:${playerSeconds}` //засовываем в общую переменную с часами
        }
        if (playerHours > 0 && playerMinutes < 10) { //если останова имеет часы, а минуты меньше 10, то отображаем 0 у минут
            timeVideo = `${playerHours}:0${playerMinutes}:${playerSeconds}`
        }


        tdTable.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}` //засовываем в первую ячейку дату и время
        td2Table.textContent = event.textContent //засовываем во вторую ячейку наименование кнопки
        td3Table.textContent = timeVideo //засовываем в 3 ячейку время на видео
        
        table.append(trTable) //засовываем в html созданную строку
        trTable.append(tdTable) //засовываем в html созданную 1 ячейку
        trTable.append(td2Table) //засовываем в html созданную 2 строку
        trTable.append(td3Table) //засовываем в html созданную 3 строку
    })
})

window.location.href = "#" + localStorage.getItem('href2') //чтобы в урл сохранялась переданная ссылка