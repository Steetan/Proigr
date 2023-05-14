let url //ссылка на видео для видео
let url2 //ссылка на видео для урл

if(window.location.href.includes("?=https://www.youtube.com") //проверяем вставили ли мы обычную ссылку и укороченную ссылку в урл
    || window.location.href.includes("?=https://youtu.be")) {  

    if(window.location.href.includes("https://www.youtube.com/live/")) { //если мы вставили трансляцию
        url = window.location.href.toString()
        .replace("?feature=share", "")
        .split("live/")  //берем последнее из ссылки до youtu.be/
        .pop() //удаляем ненужный последний элемент

        url2 = window.location.href
        .toString() //переводим в строку
        .split("?=") //обрезаем урл
        .pop() //обрезаем ссылку для урл
    }
    if(window.location.href.includes("https://www.youtube.com/watch")) {  //если мы вставили обычную ссылку
        url = window.location.href //берем весь урл
            .toString() //переводим в строку
            .split("watch?v=") //обрезаем урл
            .pop() //удаляем ненужный последний элемент

        url2 = window.location.href
            .toString() //переводим в строку
            .split("?=") //обрезаем урл
            .pop() //обрезаем ссылку для урл
    }
    if(window.location.href.includes("https://youtu.be")) { //если мы вставили укороченную ссылку
        url = window.location.href.toString()
            .split("youtu.be")  //берем последнее из ссылки до youtu.be/
            .pop() //удаляем ненужный последний элемент
        url2 = window.location.href
            .toString()
            .split("?=")
            .pop() //обрезаем ссылку для урл
    }

    window.localStorage.setItem('href', url)  //перекидываем полученную ссылку на локальное хранилище
    window.localStorage.setItem('href2', url2)  //перекидываем полученную ссылку для урл на локальное хранилище
    window.open("player.html", "_self")  //открываем проигрыватель
}

if(window.location.href.includes("#")) { // Если мы по стрелочке вернемся на главный экран или через урл, чтобы стиралась ссылка на видео на главной странице
    window.location.href = window.location.href.split('#')[0]
}