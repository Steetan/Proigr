let urlString
let fullUrlString

if(!window.location.href.includes("#https://")) { //если в строке урл не будет никакой ссылки
    window.location.href = `#https://www.youtube.com/watch?v=W57EKdp3nf8` //подставляем дефолтную ссылку
}

function btnForm() { //событие на нажатие кнопки Открыть
    window.location.href = "#" + document.querySelector(".form__text").value //подставляем в урл ссылку которую мы взяли из инпут
    if(window.location.href.includes(fullUrlString)) { //если ссылка введеная в строку для урл повторяется
        window.open(window.location.href + "#" + fullUrlString, "_self") //то мы открываем страницу с этим урл
    }
}

// Это все нужно для настройки проигрывателя
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    videoId: urlString, // сюда вставляется ссылка, переданная по урл
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

window.addEventListener('hashchange', function(){ //накладываем прослушку на строку урл
    window.location.reload() //перезагружаем страницу
});

function getUrlFunc(split) { //общая функция для ключа видео
    return window.location.href //берем урл
        .toString() //превращаем в строку
        .split(split) //обрезаем урл
        .pop() //удаляем ненужный последний элемент
        .replace('?feature=share','')
}
function getFullUrlFunc() { //общая функция для полной ссылки видео
    return window.location.href
        .toString() //превращаем в строку
        .split("#") //обрезаем урл
        .pop() //обрезаем ссылку для урл
        .replace('?feature=share','')
}
if(window.location.href.includes("https://www.youtube.com/watch?v=")) {  //если мы вставили обычную ссылку
    urlString = getUrlFunc("watch?v=")
    fullUrlString = getFullUrlFunc()
}
if(window.location.href.includes("https://www.youtube.com/live/")) {  //если мы вставили live ссылку
    urlString = getUrlFunc("live/")
    fullUrlString = getFullUrlFunc()
}
if(window.location.href.includes("https://www.youtube.com/shorts")
|| window.location.href.includes("https://youtube.com/shorts/")) {  //если мы вставили шортс ссылку
    urlString = getUrlFunc("shorts/")
    fullUrlString = getFullUrlFunc()
}
if(window.location.href.includes("https://youtu.be/")) { //если мы вставили укороченную ссылку
    urlString = getUrlFunc("youtu.be/")
    fullUrlString = getFullUrlFunc()
}
window.location.href = "#" + fullUrlString //подставляем в строку урл результат

let timeGraphic = []
let fullTimeGraphic = []
let tdBtnTable = []
let dltBtnTable = []
let arrBtn1 = [0]
let arrBtn2 = [0]
let arrBtn3 = [0]

// Настройка графика
let chart = new Chart(document.getElementById("graphic"), { 
    type: 'line',
    data: {
      labels: fullTimeGraphic,
      datasets: [{ 
          data: arrBtn1, //Кнопка
          label: "Button 1", //Наименование кнопки
          borderColor: "#3e95cd", //цвет линии
          fill: false
        }, { 
          data: arrBtn2,
          label: "Button 2",
          borderColor: "#8e5ea2",
          fill: false 
        }, { 
          data: arrBtn3,
          label: "Button 3",
          borderColor: "#3cba9f",
          fill: false
        }
      ]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'График нажатий кнопок по времени видео' //заголовок графика
            }
        },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Количество нажатий' //надпись по оси y
          }
        },
        x: {
          title: {
            display: true,
            text: 'Время видео' //надпись по оси x
          }
        }
    }
}
});
//======================================================================

const btn = document.querySelectorAll(".btn") //ищем все кнопки
const tableBody = document.querySelector("tbody") //ищем таблицу
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
        month = "0" + (month + 1) //добавляем единицу потому что в js месяца начинаются с нуля
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
        let td4Table = document.createElement("td") // создаем элемент td
        
        trTable.classList.add("trBlockTable") //добавляем классы к строкам
        td3Table.classList.add("td3Table") //добавляем классы к ячейкам с временем
        td4Table.classList.add("delete-btn") //добавляем классы к кнопкам удаления с названием нажатых кнопок 

        if(event.textContent == "1") { //если содержимое нажатой кнопки равна 1, 2 или 3
            td4Table.classList.add("delete-btn--1") //то добавляем определенный класс
        }
        if(event.textContent == "2") {
            td4Table.classList.add("delete-btn--2")
        }
        if(event.textContent == "3") {
            td4Table.classList.add("delete-btn--3")
        }

        let timeVideoSeconds = !player.getCurrentTime ? //проверяем, можно ли брать с видео время
            0.0 //если нельзя, то ставим ноль
            : 
            Math.floor(player.getCurrentTime()) //если можно, то получаем время остановы в секундах

        function getFullTimeFunc(timeVideoSeconds) { //функция перевода времени в часы, минуты и секунды
            // Раскладываем полученные из видео секунды на часы, минуты и секунды
            let playerHours = Math.floor(timeVideoSeconds / 60 / 60)
            let playerMinutes = Math.floor((timeVideoSeconds / 60) - (playerHours * 60))
            let playerSeconds = Math.floor(timeVideoSeconds % 60)

            // если секунды меньше десяти то добавляем 0
            if (playerSeconds < 10) {
                playerSeconds = "0" + playerSeconds
            }

            // если останова не имеет часы то
            if(playerHours <= 0) {
                return `${playerMinutes}:${playerSeconds}` //возвращаем полученное
            }
            // если останова имеет часы то отображаем их
            if (playerHours > 0) {
                return `${playerHours}:${playerMinutes}:${playerSeconds}`
            }
            // если останова имеет часы и имеет минуты которые меньше 10
            if (playerHours > 0 && playerMinutes < 10) {
                return `${playerHours}:0${playerMinutes}:${playerSeconds}`
            }
        }

        tdTable.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}` //засовываем в первую ячейку дату и время
        td2Table.textContent = event.textContent //засовываем во вторую ячейку наименование кнопки
        td3Table.textContent = getFullTimeFunc(timeVideoSeconds) //засовываем в 3 ячейку время на видео
        td4Table.innerHTML = "<img class='delete-img' src='delete.png' alt=''>" //в 4 кнопку засовываем тег картинки
          
        tableBody.prepend(trTable) //засовываем в html созданную строку
        trTable.append(tdTable, td2Table, td3Table, td4Table) //засовываем в html созданные ячейки

        // если времени из ютуба нету в массиве то
        if(!timeGraphic.includes(timeVideoSeconds)) {
            timeGraphic.push(Math.floor(timeVideoSeconds)) //добавляем время в массив
            timeGraphic.sort(function(a, b) { //сортируем по возрастанию
                return a - b;
            });
            
            arrBtn1.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0) //добавляем к массивам кнопок нули для нового времени
            arrBtn2.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
            arrBtn3.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
            
            for (let element of timeGraphic) {      
                if(!fullTimeGraphic.includes(getFullTimeFunc(element))) {
                    fullTimeGraphic.splice(
                        timeGraphic.indexOf(Math.floor(timeVideoSeconds)), 0, getFullTimeFunc(element)) //засовываем нормальное время в индекс под которым находится тоже самое время в секундах
                }
            }
            chart.update() //обновляем график
        }

        // если время из ютуба есть в массиве то
        if(timeGraphic.includes(timeVideoSeconds)) {
            if(event.classList.contains("btn--1")) { //если нажатая кнопка имеет такой класс
                arrBtn1[timeGraphic.indexOf(timeVideoSeconds)]++ //мы к элементу массива времени добавляем единицу
            } 
            if(event.classList.contains("btn--2")) {
                arrBtn2[timeGraphic.indexOf(timeVideoSeconds)]++
            }
            if(event.classList.contains("btn--3")) {
                arrBtn3[timeGraphic.indexOf(timeVideoSeconds)]++
            }
        } 

        tdBtnTable = document.querySelectorAll(".td3Table") //ищем ячейки
        dltBtnTable = document.querySelectorAll(".delete-btn")//ищем кнопки удаления

        function getTimeSeconds(timeTableArr) { //функция перевода времени в секунды
            //Здесь мы переводим из часов, минут и секунд только в секунды
            if(timeTableArr.length <= 2) { //если нету часов
                timeTableArr[0] *= 60
                return +(timeTableArr[0]) + +(timeTableArr[1]) //возвращаем полученное
            }
            if(timeTableArr.length > 2) { // если есть часы
                timeTableArr[0] *= 3600
                timeTableArr[1] *= 60
                return +(timeTableArr[0]) + +(timeTableArr[1]) + +(timeTableArr[2])
            }
        }

        dltBtnTable.forEach(function(e) {
            e.onclick = function() {
                if(e.classList.contains("delete-btn--1")) { //если кнопка элемента имеет такой класс
                    arrBtn1[timeGraphic.indexOf(
                        getTimeSeconds(e.previousSibling.textContent.match( /\d+/g )))]-- //мы вычитаем единицу из элемента, индекс которого равен соседней ячейки с временем
                }
                if(e.classList.contains("delete-btn--2")) {
                    arrBtn2[timeGraphic.indexOf(
                        getTimeSeconds(e.previousSibling.textContent.match( /\d+/g )))]--
                }
                if(e.classList.contains("delete-btn--3")) {
                    arrBtn3[timeGraphic.indexOf(
                        getTimeSeconds(e.previousSibling.textContent.match( /\d+/g )))]--
                }

                if(arrBtn1[timeGraphic.indexOf(
                        getTimeSeconds(e.previousSibling.textContent.match( /\d+/g )))] == 0 //если в точке времени у троих линий по нулям, то удаляем точку времени и точки у кнопок
                && arrBtn2[timeGraphic.indexOf(
                        getTimeSeconds(e.previousSibling.textContent.match( /\d+/g )))] == 0 
                && arrBtn3[timeGraphic.indexOf(
                        getTimeSeconds(e.previousSibling.textContent.match( /\d+/g )))] == 0) {
                    arrBtn1.splice(
                            timeGraphic.indexOf(
                                getTimeSeconds(e.previousSibling.textContent.match( /\d+/g ))), 1) //удаляем точку времени и и точки у кнопок
                    arrBtn2.splice(
                            timeGraphic.indexOf(
                                getTimeSeconds(e.previousSibling.textContent.match( /\d+/g ))), 1)
                    arrBtn3.splice(
                            timeGraphic.indexOf(
                                getTimeSeconds(e.previousSibling.textContent.match( /\d+/g ))), 1)

                    fullTimeGraphic.splice(
                            timeGraphic.indexOf(
                                getTimeSeconds(e.previousSibling.textContent.match( /\d+/g ))), 1) //удаляем точку времени
                    timeGraphic.splice(
                            timeGraphic.indexOf(
                                getTimeSeconds(e.previousSibling.textContent.match( /\d+/g ))), 1)
                }
                chart.update() //обновляем график
            }
        })
        dltBtnTable.forEach(function(event) { //Здесь мы удаляем запись из таблицы, если мы нажали на кнопку удаления
            event.addEventListener("click", function() {
                event.parentNode.remove()
            })
        })
        tdBtnTable.forEach(function(event) { //находим все 3 ячейки строк
            event.parentElement.addEventListener("click", function() { // накладываем прослушку на строку
                player.seekTo(getTimeSeconds(event.textContent.match( /\d+/g ))); // перематываем видео на полученные секунды
            })
        })
        chart.update() //обновляем график
    })
})