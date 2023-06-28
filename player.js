var auth_data
let vidId = "luKquWe89jo" // defaults
let vidUrl = "https://www.youtube.com/watch?v=luKquWe89jo"
let wsource = 'yt' // default for yt
var player
var vidTime

document.querySelector(".buttons__input--left").value = "0:00"
document.querySelector(".buttons__input--right").value = "0:00"

// адреса апи
var api_url = get_api_url()
var api_btn_url = "/api/wote/vote/"
var api_sum_url = "/api/wote/vote/sums/"
var api_user_votes_url = "/api/wote/vote/my/"

// массивы для таблицы и графика
var timeGraphic = [0]
var fullTimeGraphic = ["0:00"]
var tdBtnTable = [0]
var dltBtnTable = [0]
var arrBtn1 = [0]
var arrBtn2 = [0]
var arrBtn3 = [0]

// настройка проигрывателя
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Настройка графика
var chart = new Chart(document.getElementById("graphic"), { 
    type: 'line',
    data: {
      labels: fullTimeGraphic,
      datasets: [{ 
          data: arrBtn1, //Кнопка
          label: "Да", //Наименование кнопки
          borderColor: "#3cba9f", // зелёный
          fill: false
        }, { 
          data: arrBtn2,
          label: "Нет",
          borderColor: "#e06666", // алый
          fill: false 
        }, { 
          data: arrBtn3,
          label: "Неясно",
          borderColor: "#3e95cd", // синий
          fill: false
        }
      ]
    },
    options: {
        maintainAspectRatio : false,
        responsive: false,
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
            },
        },
        scale: {
            ticks: {
                precision: 0
              }
        }

    }
});

document.getElementById("graphic").onclick = function(event) {
    let points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
    if (points.length > 0) {
        let firstPoint = points[0];
        let labelAll = String(chart.data.labels[firstPoint.index]);
        player.seekTo(getTimeSeconds(labelAll));
        timeForEdit(getTimeSeconds(labelAll))
    }
}

async function sendBtnEvent(btn, timeVideoSeconds) {
    if(!auth_data) return;
    const response = await api_request(api_url + api_btn_url, {
        method: 'POST',
        json: {
            source: wsource,
            videoid: vidId,
            button: btn,
            time: timeVideoSeconds
        },
        auth_token: auth_data.auth_token
    });
    if (response.ok) {  
        let timeRowHigh
        if(document.querySelector(".td3Table") != null) { 
            if(document.querySelector(".td3Table").classList.contains("rowHigh--active")) { //если 3 столбец не равна null таблице имеет класс для подсветки, то удаляем этот класс
                document.querySelector(".td3Table").classList.remove("rowHigh--active")
                clearTimeout(timeRowHigh)
            }
        }

        createStrokTable(new Date(), btn, "rowHigh--active", timeVideoSeconds) //создаем строку

        // если времени из ютуба нету в массиве то
        if(!timeGraphic.includes(timeVideoSeconds)) {
            timeGraphic.push(timeVideoSeconds) //добавляем время в массив
            timeGraphic.sort(function(a, b) { //сортируем по возрастанию
                return a - b;
            });

            arrBtn1.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0) //добавляем к массивам кнопок нули для нового времени
            arrBtn2.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
            arrBtn3.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
        }  

        if(btn == "yes") {
            arrBtn1[timeGraphic.indexOf(timeVideoSeconds)]++ //мы к элементу массива времени добавляем единицу   
        }
        if (btn == "no") {
            arrBtn2[timeGraphic.indexOf(timeVideoSeconds)]++
        }
        if (btn == "not") {
            arrBtn3[timeGraphic.indexOf(timeVideoSeconds)]++
        }   

        //todo убрать цикл
        for (let element of timeGraphic) {      
            fullTimeGraphic[timeGraphic.indexOf(element)] = getFullTimeFunc(element) //засовываем нормальное время в индекс под которым находится тоже самое время в секундах
        }

        timeRowHigh = setTimeout(function() {
            trTable.classList.remove("rowHigh--active")
        }, 1000);

        chart.update() //обновляем график        
    } else {
        alert("sendbtn" + response);
    }   
}

async function onDelBtnEvent(event) {
    if(!auth_data) return;
    let timeSeconds = getTimeSeconds(event.previousSibling.textContent)
    const response = await api_request(api_url + api_btn_url, {
        method: 'DELETE',
        json: {
            source: wsource,
            videoid: vidId,
            time: timeSeconds
        },
        auth_token: auth_data.auth_token
    });
        
    if (response.ok) {
        // api returns nothing in this method
        // const data = response.data;
        remVote(event.previousSibling)
        chart.update()
    } else {
        alert("delbtn" + response);
    }
}

async function getUserVotes() {
    if(!auth_data) return;
    var headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    const response = await api_request(
        api_url + api_user_votes_url + '?source=' + wsource + '&videoid=' + vidId,
        {
            headers: headers,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }                            
    );
    if (response.ok) {
        // put data in table 
        const data = response.data;
    
        // put user votes in table
        for (let t of data.votes) {
            createStrokTable(new Date(t.update_timestamp * 1000), t.button, "", t.time)
        }
    } else {
        alert("getuservotes" + response);
    }
}

function createStrokTable(dateTime, btnName, classRowHigh, timeForTd) {
    let date = dateTime
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
    if(classRowHigh != "") {
        trTable.classList.add(classRowHigh)
    }
    td3Table.classList.add("td3Table") //добавляем классы к ячейкам с временем
    td4Table.classList.add("delete-btn") //добавляем классы к кнопкам удаления с названием нажатых кнопок 
    
    tdTable.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}` //засовываем в первую ячейку дату и время
    switch (btnName) {//засовываем во вторую ячейку наименование кнопки
        case "yes":
            td2Table.textContent = "Да"
            break;
        case "no":
            td2Table.textContent = "Нет"
            break;
        case "not":
            td2Table.textContent = "Неясно"
            break;
    }
    td3Table.textContent = getFullTimeFunc(timeForTd) //засовываем в 3 ячейку время на видео
    td4Table.innerHTML = "<div class='delete-btn-table-block'><div class='delete-btn-table'></div></div>" //в 4 кнопку засовываем тег картинки

    document.querySelector("tbody").prepend(trTable) //засовываем в html созданную строку
    trTable.append(tdTable, td2Table, td3Table, td4Table)

    td3Table.onmouseover = function() { // накладываем прослушку на строку {}
        addClassTd(this)
    }
    td3Table.onmouseout = function() { // накладываем прослушку на строку {}
        removeClassTd(this)
    }

    td4Table.onclick = function() { onDelBtnEvent(this) } //ставим на них прослушку на кнопку удаления

    rewindScroll(td3Table) // ставим прослушку на 3 столбец
}

async function getSumVotes() {
    if(!auth_data) return;
    var headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    const response = await api_request(
        api_url + api_sum_url + '?source=' + wsource + '&videoid=' + vidId,
        {
            headers: headers,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }                            
    );
    if (response.ok) {
        // put data in table 
        const data = response.data;
        // put user votes in graph

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
    } else {
        alert("getsumvotes" + response);
    }
}

$(document).ready( async function() {
    auth_data = await check_auth();
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
    
    document.querySelectorAll(".btn").forEach(function(event) {  // ищем все кнопки и ставим на все кнопки прослушки
        event.addEventListener("click", function() { // если мы нажали на эту кнопку то..
            let timeVideoSeconds = !player.getCurrentTime ? //проверяем, можно ли брать с видео время
                0.0 //если нельзя, то ставим ноль
                :   
                Math.floor(player.getCurrentTime()) //если можно, то получаем время остановы в секундах

            let bSendApi = true
            document.querySelectorAll(".td3Table").forEach(function(i) {
                if(getTimeSeconds(i.textContent) == timeVideoSeconds) {
                    // в таблице уже есть голос с таким временем
                    if(!event.classList.contains(i.previousSibling.textContent)) {
                        // изменение голоса - удаляем имеющийся - новый отправится далее
                        remVote(i)
                    } else {
                        // та же кнопка
                        bSendApi = false // отменяем отправку в апи
                    }
                    return; // голос найден - прерываем цикл
                }
            })
            if(bSendApi) {
                if(event.textContent == "Да") { //если содержимое нажатой кнопки равно да/нет/неясно
                    sendBtnEvent("yes", timeVideoSeconds)
                }
                if(event.textContent == "Нет") {
                    sendBtnEvent("no", timeVideoSeconds)
                }
                if(event.textContent == "Неясно") {
                    sendBtnEvent("not", timeVideoSeconds)
                }
            }
        })
    })

    // получаем данные о суммах голосов
    await getSumVotes();
    await getUserVotes();
});

function getTimeSeconds(timeTableArr) { //функция перевода времени в секунды
    //Здесь мы переводим из часов, минут и секунд только в секунды
    timeTableArr = String(timeTableArr).match( /\d+/g )

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

document.querySelector(".form__btn").addEventListener("click", function(event) {
    if(window.location.href.includes(document.querySelector(".form__text").value)) {
        event.preventDefault()
    }
})

function btnForm() { //событие на нажатие кнопки Открыть
    let inUrl = document.querySelector(".form__text").value //получаем ссылку которую мы взяли из инпута
    console.log(inUrl)
    if(window.location.hash.includes(inUrl)){
        console.log('reload')
        window.location.reload();
    } else {
        if(window.location.hash){ // если хэш имеется - обновляем, нет - создаём
            console.log('hash')
            window.location.hash = inUrl
        } else {
            console.log('nohash')
            window.location.href += "#" + inUrl
        }
    }
}

function remVote(elem) {
    let timeSeconds = getTimeSeconds(elem.textContent)
    if(elem.previousSibling.textContent == "Да") { //если кнопка элемента имеет такой класс
        arrBtn1[timeGraphic.indexOf(timeSeconds)]-- //вычитаем единицу из элемента, индекс которого равен соседней ячейки с временем
    } else if(elem.previousSibling.textContent == "Нет") {
        arrBtn2[timeGraphic.indexOf(timeSeconds)]--
    } else if(elem.previousSibling.textContent == "Неясно") {
        arrBtn3[timeGraphic.indexOf(timeSeconds)]--
    }
    if(arrBtn1[timeGraphic.indexOf(timeSeconds)] == 0 //если в точке времени у троих линий по нулям, то удаляем точку времени и точки у кнопок
    && arrBtn2[timeGraphic.indexOf(timeSeconds)] == 0 
    && arrBtn3[timeGraphic.indexOf(timeSeconds)] == 0) {
        arrBtn1.splice(timeGraphic.indexOf(timeSeconds), 1) //удаляем точку времени и и точки у кнопок
        arrBtn2.splice(timeGraphic.indexOf(timeSeconds), 1)
        arrBtn3.splice(timeGraphic.indexOf(timeSeconds), 1)
        fullTimeGraphic.splice(timeGraphic.indexOf(timeSeconds), 1) //удаляем точку времени
        timeGraphic.splice(timeGraphic.indexOf(timeSeconds), 1)
    }
    elem.parentNode.remove()
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

        if(urlStr.includes("&t=")) {
            vidTime = urlStr.substring(urlStr.indexOf("&t="))
                .replace("&t=", "")
                .replace("s", "")//получаем секунды остановленного времени видео
        }

        vidId = urlStr //заполняем ид видео
            .split(split) //обрезаем урл
            .pop() //удаляем ненужный последний элемент
            .replace('?feature=share','')
            .replace(/&t.*/, "")
        vidUrl = urlStr // заполняем урл видео
            .split("#") //обрезаем урл
            .pop() //обрезаем ссылку для урл
            .replace('?feature=share','')    

        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vidId}&key=AIzaSyDFH5sy-cCqcSEp0BIl8DlW3fIfvMepYNU`)
        .then(response => response.json())
        .then(data => {
            document.title = `КР-${data.items[0].snippet.title}`
        });
    } 
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: vidId, // сюда вставляется ссылка, переданная по урл
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
        },
        playerVars: {
            'start': vidTime
        }
    });
}

function onPlayerStateChange() {
    timeForEdit(Math.floor(player.getCurrentTime()))
}

function onPlayerReady(event) { //функция для заполнения текущим временем из видео инпут полей
    event.target.playVideo();
    setInterval(() => {
        if(player.getPlayerState() == 1) {
            timeForEdit(Math.floor(player.getCurrentTime()))
            if(player.getPlayerState() == 2) {
                timeForEdit(Math.floor(player.getCurrentTime()))
            }
        }
    }, 100);
}

function rewindScroll(elem) {
    elem.onclick = function() { // накладываем прослушку на строку
        player.seekTo(getTimeSeconds(this.textContent)); // перематываем видео на полученные секунды
        document.querySelector("#player").scrollIntoView({//скроллим до плеера
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function addClassTd(elem) {
    if(getTimeSeconds(elem.textContent) < Math.floor(player.getCurrentTime())) {
        elem.classList.add("td3Table--right")
    }
    if(getTimeSeconds(elem.textContent) == Math.floor(player.getCurrentTime())) {
        elem.classList.add("td3Table--middle")
    }
    if(getTimeSeconds(elem.textContent) > Math.floor(player.getCurrentTime())) {
        elem.classList.add("td3Table--left")
    }
    elem.classList.add("hover")
}

function removeClassTd(elem) {
    if(getTimeSeconds(elem.textContent) < Math.floor(player.getCurrentTime())) {
        elem.classList.remove("td3Table--right")
    }
    if(getTimeSeconds(elem.textContent) == Math.floor(player.getCurrentTime())) {
        elem.classList.remove("td3Table--middle")
    }
    if(getTimeSeconds(elem.textContent) > Math.floor(player.getCurrentTime())) {
        elem.classList.remove("td3Table--left")
    }
    elem.classList.remove("hover")
}

function timeForEdit(time) {
    if(!(time - 2 < 0)) {
        document.querySelector(".buttons__input--left").value = getFullTimeFunc(time - 1)
    } else {
        document.querySelector(".buttons__input--left").value = "0:00"
    }
    document.querySelector(".buttons__input--right").value = getFullTimeFunc(time + 1)
}

function stopVideo() {
    player.stopVideo();
} 

function mapSchemeLink(btn, videoId) {
    document.querySelector(btn).href = 
    videoId + vidId + "&source=yt" 
    + "&f=" + getTimeSeconds(document.querySelector(".buttons__input--left").value)
    + "&t=" + getTimeSeconds(document.querySelector(".buttons__input--right").value)
}

document.addEventListener("click", function(event) {
    if(event.target.closest(".buttons__btn--map")) {
        mapSchemeLink(".buttons__btn--map", "https://map.blagoroda.org/?videoid=")
    }
    if(event.target.closest(".buttons__btn--scheme")) {
        mapSchemeLink(".buttons__btn--scheme", "https://graph.blagoroda.org/?videoid=")
    }
    if(event.target.closest(".graphic-button")) {
        getSumVotes()
    }
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

document.addEventListener("click", function(event) {
    if(event.target.closest(".btn-popup")) {//накладываем прослушки на кнопку открытия модал. окна и кнопку закрытия модал. окна
        document.querySelector(".popup").classList.add("popup--active") //создаем нужный класс
        document.body.style.overflow = "hidden" //скрываем скролл
    }
    if(event.target.closest(".popup-close")) {
        document.querySelector(".popup").classList.remove("popup--active")
        document.body.style.overflow = "auto" //даем возможность скроллить
    }
})