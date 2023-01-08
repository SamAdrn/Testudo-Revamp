async function suggest(input) {
    let resDiv = document.getElementById(`${input.id}-sug`);
    let suggestions = [];
    if (input.value.length > 2) {
        const url = "/suggest?" + new URLSearchParams({ search: input.value }).toString()
        await fetch(url)
            .then((response) => response.json())
            .then((json) => suggestions = json)
    } 
    if (suggestions.length !== 0) {
        let result = '';
        suggestions.forEach((course) => {
            let fullCourse = `${course.course_id} — ${course.name}`
            result += `<li onclick="fill('${input.id}', '${fullCourse}')">${fullCourse}</li>`;
        })
        resDiv.innerHTML = `<ul>${result}</ul>`;
        resDiv.hidden = false;
    }
    else {
        resDiv.hidden = true;
    }
}

function fill(input, val) {
    document.getElementById(`${input}`).value = val;
    document.getElementById(`${input}-sug`).hidden = true;
}