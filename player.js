window.location.href = "#" + localStorage.getItem('href2') //чтобы в урл сохранялась переданная ссылка

document.querySelector(".video").src 
    = localStorage.getItem('href')  //вытаскиваем урл из локального хранилища и вставляем в атрибут проигрывателя
