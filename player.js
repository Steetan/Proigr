var auth_data
let vidId = "nvVftQ2ZE94" // defaults
let vidUrl = "https://www.youtube.com/watch?v=" + vidId
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
var api_auth_temp_token_url = "/api/token/authdata/"

// массивы для таблицы и графика
var timeGraphic = [0]
var fullTimeGraphic = ["0:00"]
var tdBtnTable = [0]
var dltBtnTable = [0]
var arrBtn1 = [0]
var arrBtn2 = [0]
var arrBtn3 = [0]

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

// todo check graphic clicks
document.getElementById("graphic").onclick = function(event) {
    let points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
    if (points.length > 0) {
        let firstPoint = points[0];
        let labelAll = String(chart.data.labels[firstPoint.index]);
        player.seekTo(getTimeSeconds(labelAll));
        timeForEdit(getTimeSeconds(labelAll))
    }
}

let dblClick = false
async function sendBtnEvent(btn, timeVideoSeconds) {
    if(!auth_data || dblClick) return;
    dblClick = true
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
        dblClick = false
        // ищем и удаляем строку с имеющимся голосом в это же время
        document.querySelectorAll(".td3Table").forEach(function(i) {
            if(getTimeSeconds(i.textContent) == timeVideoSeconds) {
                // в таблице уже есть голос с таким временем
                // замена голоса - удаляем имеющийся - новый отправится далее
                remVote(i)
                return; // голос найден - прерываем цикл
            }
        })
        createStrokTable(new Date(), btn, true, timeVideoSeconds) //создаем строку c подсветкой
        updateTimeAxis(timeVideoSeconds) // добавляем время на шкалу и в массивы графика
        if(btn == "yes") {
            arrBtn1[timeGraphic.indexOf(timeVideoSeconds)]++ //к элементу массива времени добавляем единицу   
        }
        if (btn == "no") {
            arrBtn2[timeGraphic.indexOf(timeVideoSeconds)]++
        }
        if (btn == "not") {
            arrBtn3[timeGraphic.indexOf(timeVideoSeconds)]++
        }   
        chart.update() //обновляем график        
    } else {
        // todo remove alerts
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
    } else { alert("delbtn" + response); }
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
        const data = response.data;
        for (let t of data.votes) { // put user votes in table
            createStrokTable(new Date(t.update_timestamp * 1000), t.button, false, t.time)
        }
    } else { alert("getuservotes" + response); }
}

function createStrokTable(dateTime, btnName, bHighLight, timeVideoSeconds) {
    let day = dateTime.getDate() //получаем день
    let month = dateTime.getMonth() //получаем месяц
    let year = dateTime.getFullYear() //получаем год
    let hours = dateTime.getHours() //получаем часы
    let minutes = dateTime.getMinutes() //получаем минуты
    let seconds = dateTime.getSeconds() //получаем секунды
    //Добавляем нули к числам если они меньше 10
    if(day < 10) { day = "0" + day }
    if(month < 10) { month = "0" + (month + 1) } //добавляем единицу потому что в js месяца начинаются с нуля
    if(hours < 10) { hours = "0" + hours }
    if(minutes < 10) { minutes = "0" + minutes }
    if(seconds < 10) { seconds = "0" + seconds }

    trTable = document.createElement("tr") // создаем элемент tr
    tdTable = document.createElement("td") // создаем элемент td
    td2Table = document.createElement("td") // создаем элемент td
    td3Table = document.createElement("td") // создаем элемент td
    td4Table = document.createElement("td") // создаем элемент td
    trTable.append(tdTable, td2Table, td3Table, td4Table)
    trTable.classList.add("trBlockTable") //добавляем классы к строкам

    if(bHighLight) {
        trTable.classList.add("rowHigh--active") // накладываем временную подсветку
        setTimeout(function() { // убираем временную подсветку по таймауту
            trTable.classList.remove("rowHigh--active")
        }, 1000);
    }
    tdTable.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}` //засовываем в первую ячейку дату и время
    switch (btnName) {//во вторую ячейку пишем наименование кнопки
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
    let timeVideo = getFullTimeFunc(timeVideoSeconds)
    td3Table.classList.add("td3Table") //добавляем классы к ячейкам с временем
    td3Table.onmouseover = function() { addClassTd(this) }
    td3Table.onmouseout = function() { removeClassTd(this) }
    td3Table.textContent = timeVideo //помещаем в 3 ячейку время на видео
    td3Table.onclick = function() { 
      player.seekTo(timeVideoSeconds)
      timeForEdit(timeVideoSeconds)
      document.querySelector("#player").scrollIntoView({ //скроллим до плеера
          behavior: 'smooth',
          block: 'center'
      });
    }          
    td4Table.innerHTML = "<div class='delete-btn-table-block'><div class='delete-btn-table'></div></div>" //в 4 кнопку засовываем тег картинки
    td4Table.classList.add("delete-btn") //добавляем классы к кнопкам удаления с названием нажатых кнопок 
    td4Table.onclick = function() { onDelBtnEvent(this) } //ставим на них прослушку на кнопку удаления

    document.querySelector("tbody").prepend(trTable) //засовываем в html созданную строку
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

    // настройка проигрывателя
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    document.querySelectorAll(".btn").forEach(function(event) {  // ищем все кнопки и ставим на все кнопки прослушки
        event.addEventListener("click", function() { // если мы нажали на эту кнопку то..
            let timeVideoSeconds = !player.getCurrentTime ? //проверяем, можно ли брать с видео время
                0.0 //если нельзя, то ставим ноль
                :   
                Math.floor(player.getCurrentTime()) //если можно, то получаем время остановы в секундах

            if(event.textContent == "Да") { //если содержимое нажатой кнопки равно да/нет/неясно
                sendBtnEvent("yes", timeVideoSeconds)
            }
            if(event.textContent == "Нет") {
                sendBtnEvent("no", timeVideoSeconds)
            }
            if(event.textContent == "Неясно") {
                sendBtnEvent("not", timeVideoSeconds)
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
        window.location.reload();
    } else {
        if(window.location.hash){ // если хэш имеется - обновляем, нет - создаём
            window.location.hash = inUrl
        } else { window.location.href += "#" + inUrl }
    }
}

function remVote(elem) {
    let timeSeconds = getTimeSeconds(elem.textContent)
    switch (elem.previousSibling.textContent) {
        case "Да":
            arrBtn1[timeGraphic.indexOf(timeSeconds)]-- //вычитаем единицу из элемента, индекс которого равен соседней ячейки с временем
            break;
        case "Нет":
            arrBtn2[timeGraphic.indexOf(timeSeconds)]--
            break;
        case "Неясно":
            arrBtn3[timeGraphic.indexOf(timeSeconds)]--
            break;    
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

        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vidId}&key=${YT_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            document.title = `КР-${data.items[0].snippet.title}`
        });
    } 
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: vidId, //ид видео из урл
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

function onPlayerReady(event) { //заполнение инпут полей текущим временем из видео при проигрывании 
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
    if(!(time - 1 < 0)) {
        document.querySelector(".buttons__input--left").value = getFullTimeFunc(time - 1)
    } else {
        document.querySelector(".buttons__input--left").value = "0:00"
    }
    document.querySelector(".buttons__input--right").value = getFullTimeFunc(time + 1)
}

function stopVideo() {
    player.stopVideo();
} 
/*
function mapSchemeLink(btn, url) {
    var href_url = btn + url + vidId + "&source=yt"
    + "&f=" + getTimeSeconds(document.querySelector(".buttons__input--left").value)
    + "&t=" + getTimeSeconds(document.querySelector(".buttons__input--right").value)
//    document.querySelector(btn).href = href_url 
    window.open(href_url, '_blank').focus();
}
*/

function openBtnLink(url_str) {
    window.open(url_str, '_blank').focus();    
}

document.addEventListener("click", async function(event) {
    event.preventDefault();
    if(event.target.closest(".buttons__btn--map")) {
        var url_str = "https://map.blagoroda.org/?videoid=" + vidId + "&source=yt"
            + "&f=" + getTimeSeconds(document.querySelector(".buttons__input--left").value)
            + "&t=" + getTimeSeconds(document.querySelector(".buttons__input--right").value)
        
        if (auth_data) {
            const response = await api_request(api_url + api_auth_temp_token_url, {
                method: 'POST',
                json: { auth_data: auth_data, },
                auth_token: auth_data.auth_token
            });
            if (response.ok) { // put token in url 
                const data = response.data;
                if (data.authdata_token) { 
                    url_str += "&authdata_token=" + data.authdata_token 
                }
            }
        }
        openBtnLink(url_str)
    }
    if(event.target.closest(".buttons__btn--scheme")) {
        var url_str = "https://graph.blagoroda.org/?videoid=" + vidId + "&source=yt"
            + "&f=" + getTimeSeconds(document.querySelector(".buttons__input--left").value)
            + "&t=" + getTimeSeconds(document.querySelector(".buttons__input--right").value)
        
        if (auth_data) {
            const response = await api_request(api_url + api_auth_temp_token_url, {
                method: 'POST',
                json: { auth_data: auth_data, },
                auth_token: auth_data.auth_token
            });
            if (response.ok) { // put token in url 
                const data = response.data;
                if (data.authdata_token) { 
                    url_str += "&authdata_token=" + data.authdata_token 
                }
            }
        }
        openBtnLink(url_str)
    }
    if(event.target.closest(".graphic-button")) {
        getSumVotes()
    }
})

function updateTimeAxis(timeVideoSeconds) {
    // добавление времени на шкалу и в массивы графика
    if(!timeGraphic.includes(timeVideoSeconds)) { // если времени нет в массиве
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
