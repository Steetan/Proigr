let url = window.location.href //получаем урл сайта

if(window.location.href.includes("?=https://")) {  //проверяем вставили ли мы ссылку на видео
    url = window.location.href.toString().split("?=") //обрезаем урл
        .pop() //удаляем ненужный последний элемент
        .replace("watch?v=", "embed/") //делаем так чтобы проигрыватель работал

    window.localStorage.setItem('href', url)  //перекидываем полученный урл на локальное хранилище
    window.open("player.html", "_self")  //открываем проигрыватель
}

