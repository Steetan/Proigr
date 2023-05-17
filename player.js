let url = url2 = window.location.href //получаем урл сайта
let videoUrl = "W57EKdp3nf8" //дефолтное видео
let videoUrl2 = "https://www.youtube.com/watch?v=W57EKdp3nf8" //полная ссылка видео

if(window.location.href.includes("?=https://www.youtube.com") //проверяем вставили ли мы обычную ссылку и укороченную ссылку в урл
    || window.location.href.includes("?=https://youtu.be")) {  
    if(!window.location.href.includes("https://youtu.be")) {  //если мы не вставили укороченную ссылку
        url = window.location.href.toString().split("watch?v=") //обрезаем урл
            .pop() //удаляем ненужный последний элемент
        url2 = window.location.href.toString().split("?=").pop() //обрезаем ссылку для урл
    }
    if(window.location.href.includes("https://youtu.be")) { //если мы вставили укороченную ссылку
        url = window.location.href.toString()
            .split("youtu.be/")  //берем последнее из ссылки до youtu.be/
            .pop()
        url2 = window.location.href.toString().split("?=").pop() //обрезаем ссылку для урл
    }

    window.localStorage.setItem('href', url)  //перекидываем полученный урл на локальное хранилище
    window.localStorage.setItem('href2', url2)  //перекидываем полученный урл на локальное хранилище

    window.open("index.html", "_self")  //открываем проигрыватель
}

if(window.localStorage.getItem('href') != "null" 
    && window.localStorage.getItem('href2') != "null") { //если в локалстораже ничего не лежит то вставляем дефолтное видео
    videoUrl = window.localStorage.getItem('href')
    videoUrl2 = window.localStorage.getItem('href2')
}

if(window.location.href.includes("#")) { // Если мы по стрелочке вернемся на главный экран или через урл, чтобы стиралась ссылка на видео на главной
    window.location.href = window.location.href.split('#')[0]
}

// Это все нужно для настройки проигрывателя
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    videoId: videoUrl, // сюда вставляется ссылка, переданная по урл
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

let timeGraphic = []
let tdBtnTable = []
let dltBtnTable = []
let arrBtn1 = [0]
let arrBtn2 = [0]
let arrBtn3 = [0]

// Настройка графика
let chart = new Chart(document.getElementById("graphic"), {
    type: 'line',
    data: {
      labels: timeGraphic,
      datasets: [{ 
          data: arrBtn1,  //1 кнопка
          label: "Button 1",
          borderColor: "#3e95cd", //цвет линии
          fill: false
        }, { 
          data: arrBtn2, //2 кнопка
          label: "Button 2",
          borderColor: "#8e5ea2", //цвет линии
          fill: false 
        }, { 
          data: arrBtn3, //3 кнопка
          label: "Button 3",
          borderColor: "#3cba9f", //цвет линии
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
            text: 'Время видео (в секундах)' //надпись по оси x
          }
        }
    }
}
});
//======================================================================

btn.forEach(function(event) {  // ставим на все кнопки прослушки
    event.addEventListener("click", function btnFoo() { // если мы нажали на эту кнопку то..
        let trTable = document.createElement("tr") // создаем элемент tr
        let tdTable = document.createElement("td") // создаем элемент td
        let td2Table = document.createElement("td") // создаем элемент td
        let td3Table = document.createElement("td") // создаем элемент td
        let td4Table = document.createElement("td") // создаем элемент td

        td4Table.classList.add("delete-btn") //добавляем классы к кнопкам удаления с названием нажатых кнопок 
        if(event.textContent == "1") { //если содержимое нажатой кнопки равна 1
            td4Table.classList.add("delete-btn--1") //то добавляем класс
        }
        if(event.textContent == "2") {
            td4Table.classList.add("delete-btn--2")
        }
        if(event.textContent == "3") {
            td4Table.classList.add("delete-btn--3")
        }
        td3Table.classList.add("td3Table")

        let timeVideoSeconds = Math.floor(player.getCurrentTime()) //получаем время остановы в секундах

        // Раскладываем полученные из видео секунды на часы, минуты и секунды
        let playerHours = Math.floor(timeVideoSeconds / 60 / 60)
        let playerMinutes = Math.floor((timeVideoSeconds / 60) - (playerHours * 60))
        let playerSeconds = Math.floor(timeVideoSeconds % 60)

        // если секунды меньше десяти то добавляем 0
        if (playerSeconds < 10) {
            playerSeconds = "0" + playerSeconds
        }
        let timeVideo = `${playerMinutes}:${playerSeconds}` //засовываем в общую переменную
        
        // если останова имеет часы то отображаем их
        if (playerHours > 0) {
            timeVideo = `${playerHours}:${playerMinutes}:${playerSeconds}` //засовываем в общую переменную с часами
        }
        if (playerHours > 0 && playerMinutes < 10) { //если останова имеет часы и минуты меньше 10 то отображаем 0 у минут
            timeVideo = `${playerHours}:0${playerMinutes}:${playerSeconds}`
        }

        tdTable.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}` //засовываем в первую ячейку дату и время
        td2Table.textContent = event.textContent //засовываем во вторую ячейку наименование кнопки
        td3Table.textContent = timeVideo //засовываем в 3 ячейку время на видео
        td4Table.innerHTML = "<img class='delete-img' src='delete.png' alt=''>" //в 4 кнопку засовываем тег картинки
          
        table.prepend(trTable) //засовываем в html созданную строку
        trTable.append(tdTable) //засовываем в html созданную 1 ячейку
        trTable.append(td2Table) //засовываем в html созданную 2 ячейку
        trTable.append(td3Table) //засовываем в html созданную 3 ячейку
        trTable.append(td4Table) //засовываем в html созданную 4 ячейку

        // если времени из ютуба нету в массиве то
        if(!timeGraphic.includes(timeVideoSeconds)) {
            timeGraphic.push(Math.floor(timeVideoSeconds)) //добавляем время в массив
            timeGraphic.sort(function(a, b) { //сортируем по возрастанию
                return a - b;
            });
            arrBtn1.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0) //добавляем к массивам кнопок нули для нового времени
            arrBtn2.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
            arrBtn3.splice(timeGraphic.indexOf(timeVideoSeconds), 0, 0)
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

        dltBtnTable.forEach(function(e) {
            e.onclick = function() {
                let timeTableArr = e.previousSibling.textContent.match( /\d+/g ) //время формата ютуба делим на отдельные элементы
                let timeTable
                //Здесь мы переводим из часов, минут и секунд только в секунды
                if(timeTableArr.length <= 2) { //если нету часов
                    timeTableArr[0] *= 60
                    timeTable = +(timeTableArr[0]) + +(timeTableArr[1])
                }
                if(timeTableArr.length > 2) { // если есть часы
                    timeTableArr[0] *= 3600
                    timeTableArr[1] *= 60
                    timeTable = +(timeTableArr[0]) + +(timeTableArr[1]) + +(timeTableArr[2])
                }

                if(e.classList.contains("delete-btn--1")) { //если кнопка элемента имеет такой класс
                    arrBtn1[timeGraphic.indexOf(timeTable)]-- //мы вычитаем единицу из элемента, индекс которого равен соседней ячейки с временем
                }
                if(e.classList.contains("delete-btn--2")) {
                    arrBtn2[timeGraphic.indexOf(timeTable)]--
                }
                if(e.classList.contains("delete-btn--3")) {
                    arrBtn3[timeGraphic.indexOf(timeTable)]--
                }

                if(arrBtn1[timeGraphic.indexOf(timeTable)] == 0 //если в точке времени у троих линий по нулям, то удаляем точку времени и точки у кнопок
                && arrBtn2[timeGraphic.indexOf(timeTable)] == 0 
                && arrBtn3[timeGraphic.indexOf(timeTable)] == 0) {
                    arrBtn1.splice(timeGraphic.indexOf(timeTable), 1) //удаляем точку времени и и точки у кнопок
                    arrBtn2.splice(timeGraphic.indexOf(timeTable), 1)
                    arrBtn3.splice(timeGraphic.indexOf(timeTable), 1)
                    timeGraphic.splice(timeGraphic.indexOf(timeTable), 1)
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
                let seekArr = event.textContent.match( /\d+/g ) //время формата ютуба делим на отдельные элементы
                let seekVal
                //Здесь мы переводим из часов, минут и секунд только в секунды
                if(seekArr.length <= 2) { //если нету часов
                    seekArr[0] *= 60
                    seekVal = +(seekArr[0]) + +(seekArr[1])
                }
                if(seekArr.length > 2) { // если есть часы
                    seekArr[0] *= 3600
                    seekArr[1] *= 60
                    seekVal = +(seekArr[0]) + +(seekArr[1]) + +(seekArr[2])
                }
                player.seekTo(seekVal); // перематываем видео
            })
        })
        chart.update() //обновляем график
    })
    window.location.href = "#" + videoUrl2//чтобы в урл сохранялась переданная ссылка
})