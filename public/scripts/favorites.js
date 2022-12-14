function handleFav(btn, section) {
    let start = performance.now();
    let query =
        (btn.classList.contains("fav-checked") ? "act=rem" : "act=add") +
        `&${section}`;

    let http = new XMLHttpRequest();
    http.open("POST", "/fav", true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            if (btn.classList.contains("fav-checked")) {
                btn.classList.remove("fav-checked");
            } else {
                btn.classList.add("fav-checked");
            }
            let end = performance.now();
            console.log(`This takes ${end - start}ms`);
        }
    };
    console.log("lets start");

    http.send(query);
}
