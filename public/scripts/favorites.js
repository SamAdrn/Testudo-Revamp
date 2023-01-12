async function handleFav(btn, sectionID) {
    console.log(sectionID);
    let start = performance.now();
    let act = btn.classList.contains("fav-checked") ? "rem" : "add";
    const url =
        "/fav?" +
        new URLSearchParams({ section: sectionID, action: act }).toString();

    await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            if (json.status === 1) {
                if (act === "rem") {
                    btn.classList.remove("fav-checked");
                } else {
                    btn.classList.add("fav-checked");
                }
            }
            let end = performance.now();
            console.log(`This takes ${end - start}ms`);
        });
}
