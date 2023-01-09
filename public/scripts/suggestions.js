async function suggest(input) {
    console.log('creating suggestions');
    const resDiv = document.getElementById(`${input.id}-sug`);
    const loader = document.getElementById('loader');
    let suggestions = [];

    loader.hidden = false;

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

    loader.hidden = true;

    console.log('suggestions complete');
}

function fill(input, val) {
    document.getElementById(`${input}`).value = val;
    document.getElementById(`${input}-sug`).hidden = true;
}