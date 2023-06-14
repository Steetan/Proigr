let vidId = "luKquWe89jo" // defaults
let vidUrl = "https://www.youtube.com/watch?v=luKquWe89jo"
let wsource = 'yt' // default for yt
var player

document.querySelector(".buttons__input--left").value = "0:00"
document.querySelector(".buttons__input--right").value = "0:00"

// адреса апи
var api_url = get_api_url()
var api_btn_url = "/api/wote/vote/"
var api_sum_url = "/api/wote/vote/sums/"
var api_user_votes_url = "/api/wote/vote/my/"

// массивы для таблицы и графика
var timeGraphic = [0]
var fullTimeGraphic = [0]
var tdBtnTable = [0]
var dltBtnTable = [0]
var arrBtn1 = [0]
var arrBtn2 = [0]
var arrBtn3 = [0]

// Это все нужно для настройки проигрывателя
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Настройка графика
var canvas = document.getElementById("graphic")
var chart = new Chart(document.getElementById("graphic"), { 
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
        maintainAspectRatio : false,
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

function getUserVotes(auth_data) {
    var headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    $.ajax({
        url: api_url + api_user_votes_url + '?source=' + wsource + '&videoid=' + vidId,
        headers: headers,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {  
            // put user votes in table
            console.log(data)
            for (let t of data) {
                console.log(t)
            }
            for (let t of data) {
                console.log(t.time)
            }
        },
        error: function (error) {
            alert(error);
        }
    });
}

function getSumVotes(auth_data) {
    var headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    $.ajax({
        url: api_url + api_sum_url + '?source=' + wsource + '&videoid=' + vidId,
        headers: headers,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {  
            function updateTimeAxis(timeVideoSeconds) {
                // если времени нет в массиве
                if(!timeGraphic.includes(timeVideoSeconds)) {
                    timeGraphic.push(Math.floor(timeVideoSeconds)) //добавляем время в массив
                    timeGraphic.sort(function(a, b) { //сортируем по возрастанию
                        return a - b;
                    });

                    //добавляем к массивам кнопок нули для нового времени
                    arrBtn1.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0) 
                    arrBtn2.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
                    arrBtn3.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
  
                    // заполняем шкалу человекочитаемого времени
                    fullTimeGraphic.splice(
                        timeGraphic.indexOf(Math.floor(timeVideoSeconds)), 0, getFullTimeFunc(timeVideoSeconds)) //засовываем нормальное время в индекс под которым находится тоже самое время в секундах
                } 
            }
            
            // перебор по атрибутам объекта data.buttons: yes, no, not
            for (let t of data.buttons.yes) {
                updateTimeAxis(t.time)
                arrBtn1[timeGraphic.indexOf(t.time)] = t.count
            }
            for (let t of data.buttons.no) {
                updateTimeAxis(t.time)
                arrBtn2[timeGraphic.indexOf(t.time)] = t.count
            }
            for (let t of data.buttons.not) {
                updateTimeAxis(t.time)
                arrBtn3[timeGraphic.indexOf(t.time)] = t.count
            }            
            chart.update() //обновляем график
        },
        error: function (error) {
            alert(error);
        }
    });
}


$(document).ready( async function() {
    var auth_data = await check_auth();
    if (!auth_data) { return; };

    window.addEventListener('hashchange', function(){ //reload on hash change накладываем прослушку на строку урл
        window.location.reload();
    });

    clearURL(window.location.href.toString()) // clear url

    if(window.location.hash != ("#" + vidUrl)){
        if(window.location.hash){ // если хэш имеется - обновляем, нет - создаём
            window.location.hash = vidUrl
        } else {
            window.location.href += "#" + vidUrl
        }
    }
    
    const btn = document.querySelectorAll(".btn") //ищем все кнопки
    const tableBody = document.querySelector("tbody") //ищем таблицу

    btn.forEach(function(event) {  // ставим на все кнопки прослушки
        event.addEventListener("click", function() { // если мы нажали на эту кнопку то..
            let date = new Date()  //получаем дату
            let day = date.getDate() //получаем день
            let month = date.getMonth() //получаем месяц
            let year = date.getFullYear() //получаем год
            let hours = date.getHours() //получаем часы
            let minutes = date.getMinutes() //получаем минуты
            let seconds = date.getSeconds() //получаем секунды

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
            trTable = document.createElement("tr") // создаем элемент tr
            tdTable = document.createElement("td") // создаем элемент td
            td2Table = document.createElement("td") // создаем элемент td
            td3Table = document.createElement("td") // создаем элемент td
            td4Table = document.createElement("td") // создаем элемент td

            trTable.classList.add("trBlockTable") //добавляем классы к строкам
            td3Table.classList.add("td3Table") //добавляем классы к ячейкам с временем
            td4Table.classList.add("delete-btn") //добавляем классы к кнопкам удаления с названием нажатых кнопок 

            let timeVideoSeconds = !player.getCurrentTime ? //проверяем, можно ли брать с видео время
                0.0 //если нельзя, то ставим ноль
                :   
                Math.floor(player.getCurrentTime()) //если можно, то получаем время остановы в секундах

            if(event.textContent == "Да") { //если содержимое нажатой кнопки равна 1, 2 или 3
                sendBtnEvent(auth_data, "yes", timeVideoSeconds)
                td4Table.classList.add("delete-btn--1") //то добавляем определенный класс
            }
            if(event.textContent == "Нет") {
                sendBtnEvent(auth_data, "no", timeVideoSeconds)
                td4Table.classList.add("delete-btn--2")
            }
            if(event.textContent == "Неясно") {
                sendBtnEvent(auth_data, "not", timeVideoSeconds)
                td4Table.classList.add("delete-btn--3")
            }

            tdTable.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}` //засовываем в первую ячейку дату и время
            td2Table.textContent = event.textContent //засовываем во вторую ячейку наименование кнопки
            td3Table.textContent = getFullTimeFunc(timeVideoSeconds) //засовываем в 3 ячейку время на видео
            td4Table.innerHTML = "<img class='delete-img' src='delete.png' alt=''>" //в 4 кнопку засовываем тег картинки

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
                if(event.classList.contains("btn--1") && arrBtn1[timeGraphic.indexOf(timeVideoSeconds)] < 1 && arrBtn2[timeGraphic.indexOf(timeVideoSeconds)] < 1 && arrBtn3[timeGraphic.indexOf(timeVideoSeconds)] < 1) { //если нажатая кнопка имеет такой класс и количество нажатий у этой кнопки в эту секунду меньше 1
                    arrBtn1[timeGraphic.indexOf(timeVideoSeconds)]++ //мы к элементу массива времени добавляем единицу
                    createTableString() //создаем строку
                } 
                if(event.classList.contains("btn--2") && arrBtn2[timeGraphic.indexOf(timeVideoSeconds)] < 1 && arrBtn1[timeGraphic.indexOf(timeVideoSeconds)] < 1 && arrBtn3[timeGraphic.indexOf(timeVideoSeconds)] < 1) {
                    arrBtn2[timeGraphic.indexOf(timeVideoSeconds)]++
                    createTableString()
                }
                if(event.classList.contains("btn--3") && arrBtn3[timeGraphic.indexOf(timeVideoSeconds)] < 1 && arrBtn1[timeGraphic.indexOf(timeVideoSeconds)] < 1 && arrBtn2[timeGraphic.indexOf(timeVideoSeconds)] < 1) {
                    arrBtn3[timeGraphic.indexOf(timeVideoSeconds)]++
                    createTableString()
                }
            } 

            tdBtnTable = document.querySelectorAll(".td3Table") //ищем ячейки
            dltBtnTable = document.querySelectorAll(".delete-btn")//ищем кнопки удаления

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
                    // 2do: get time in seconds from table and make call of del
                    // let timeInSeconds = event.parentNode[]
                    // delBtnEvent(timeInSeconds)
                    event.parentNode.remove()
                })
            })
            tdBtnTable.forEach(function(event) { //находим все 3 ячейки строк
                event.parentElement.addEventListener("click", function() { // накладываем прослушку на строку
                    player.seekTo(getTimeSeconds(event.textContent.match( /\d+/g ))); // перематываем видео на полученные секунды
                })
            })
            chart.update() //обновляем график
            
            function createTableString() { //функция создания строки
                tableBody.prepend(trTable) //засовываем в html созданную строку
                trTable.append(tdTable, td2Table, td3Table, td4Table) //засовываем в html созданные ячейки
            }
        })
    })
    // получаем данные о суммах голосов
    getSumVotes(auth_data);
    getUserVotes(auth_data);
});

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

function sendBtnEvent(auth_data, btn, vote_time) {
    var headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    $.ajax({
        url: api_url + api_btn_url,
        headers: headers,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            source: wsource,
            videoid: vidId,
            button: btn,
            time: vote_time
        }),
        success: function(data) {
//            console.log(data)
        },
        error: function (error) {
//            alert(error);
        }
    });
}

function btnForm() { //событие на нажатие кнопки Открыть
    let inUrl = document.querySelector(".form__text").value //получаем ссылку которую мы взяли из инпута
    if(window.location.hash.includes(inUrl)){
        window.location.reload();
    } else {
        if(window.location.hash){ // если хэш имеется - обновляем, нет - создаём
            window.location.hash = inUrl
        } else {
            window.location.href += "#" + inUrl
        }
    }
}

function delBtnEvent(auth_data, vote_time) {
    var headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    $.ajax({
        url: api_url + api_btn_url,
        headers: headers,
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            source: wsource,
            videoid: vidId,
            time: vote_time
        })
    });
}

function clearURL(urlStr) {
    if(urlStr.includes("#https://")) { //если в строке урл не будет никакой ссылки
        let split
        if(urlStr.includes("https://www.youtube.com/watch?v=")) {  //если мы вставили обычную ссылку
            split = "watch?v="
        } else if(urlStr.includes("https://www.youtube.com/live/")) {  //если мы вставили live ссылку
            split = "live/"
        } else if(urlStr.includes("https://www.youtube.com/shorts")
        || urlStr.includes("https://youtube.com/shorts/")) {  //если мы вставили шортс ссылку
            split = "shorts/"
        } else if (urlStr.includes("https://youtu.be/")) { //если мы вставили укороченную ссылку
            split = "youtu.be/"
        }    
        vidId = urlStr //заполняем ид видео
            .split(split) //обрезаем урл
            .pop() //удаляем ненужный последний элемент
            .replace('?feature=share','')
        vidUrl = urlStr // заполняем урл видео
            .split("#") //обрезаем урл
            .pop() //обрезаем ссылку для урл
            .replace('?feature=share','')        
    } 
}
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: vidId, // сюда вставляется ссылка, переданная по урл
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    setInterval(() => {
        if(player.getPlayerState() == 1) {
            var intervalInput = setInterval(() => {
                if(!(player.getCurrentTime() - 2 < 0)) {
                    document.querySelector(".buttons__input--left").value = valueSecondsInput = getFullTimeFunc(Math.floor(player.getCurrentTime() - 2))
                } else {
                    document.querySelector(".buttons__input--left").value = "0:00"
                }
                document.querySelector(".buttons__input--right").value = getFullTimeFunc(Math.floor(player.getCurrentTime() + 2))
                if(player.getPlayerState() == 2) {
                    if(!(player.getCurrentTime() - 2 < 0)) {
                        document.querySelector(".buttons__input--left").value = valueSecondsInput = getFullTimeFunc(Math.floor(player.getCurrentTime() - 2))
                    } else {
                        document.querySelector(".buttons__input--left").value = "0:00"
                    }
                    document.querySelector(".buttons__input--right").value = getFullTimeFunc(Math.floor(player.getCurrentTime() + 2))
                    clearInterval(intervalInput)
                }
            }, 500);
        }
    }, 100);
}
function stopVideo() {
    player.stopVideo();
} 

document.querySelector(".graphic-button").addEventListener("click", function() {
    chart.update()
})

document.querySelector(".buttons__btn--map").addEventListener("click", function() {
    document.querySelector(".buttons__btn--map").href = 
        `https://map.blagoroda.org/?videoid=${vidId}&source=yt&f=${getTimeSeconds(document.querySelector(".buttons__input--left").value.match( /\d+/g ))}&t=${getTimeSeconds(document.querySelector(".buttons__input--right").value.match( /\d+/g ))}`
})

document.querySelector(".buttons__btn--scheme").addEventListener("click", function() {
    document.querySelector(".buttons__btn--scheme").href = `https://graph.blagoroda.org/?videoid=${vidId}&source=yt`
})

function getFullTimeFunc(timeVideoSeconds) { //функция перевода времени в часы, минуты и секунды
    // Раскладываем полученные из видео секунды на часы, минуты и секунды
    let playerHours = Math.floor(timeVideoSeconds / 60 / 60)
    let playerMinutes = Math.floor((timeVideoSeconds / 60) - (playerHours * 60))
    let playerSeconds = Math.floor(timeVideoSeconds % 60)

    // если секунды меньше десяти то добавляем 0
    if (playerSeconds < 10) {
        playerSeconds = "0" + playerSeconds
    }
    
    // если минуты меньше десяти то добавляем 0
    if (playerMinutes < 10 && playerHours >= 1) {
        playerMinutes = "0" + playerMinutes
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
