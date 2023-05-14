let url = url2 = window.location.href //получаем урл сайта

if(window.location.href.includes("?=https://")) {  //проверяем вставили ли мы ссылку на видео
    url = window.location.href.toString().split("?=") //обрезаем урл
        .pop() //удаляем ненужный последний элемент
        .replace("watch?v=", "embed/") //делаем так чтобы проигрыватель работал
    url2 = window.location.href.toString().split("?=").pop() //обрезаем урл
    window.localStorage.setItem('href', url)  //перекидываем полученный урл на локальное хранилище
    window.localStorage.setItem('href2', url2)  //перекидываем полученный урл на локальное хранилище
    window.open("player.html", "_self")  //открываем проигрыватель
}