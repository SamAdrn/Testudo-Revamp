async function suggest(input) {
    const resDiv = document.getElementById(`${input.id}-sug`);
    const loader = document.getElementById('loader');
    let suggestions = [];

    loader.hidden = false;

    if (input.value.length > 1) {
        const url = "/suggestCourses?" + new URLSearchParams({ search: input.value }).toString()
        await fetch(url)
            .then((response) => response.json())
            .then((json) => suggestions = json)
            .catch((e) => console.log(e));
    } 
    if (suggestions.length !== 0) {
        let result = '';
        suggestions.forEach((course) => {
            let fullCourse = `${course.course_id} — ${course.name}`
            result += [
                `<li onclick="fill('${input.id}', '${fullCourse}')">`,
                `   ${fullCourse}`,
                '</li>'
            ].join('\n');
        })
        resDiv.innerHTML = `<ul>${result}</ul>`;
        resDiv.hidden = false;
    }
    else {
        resDiv.hidden = true;
    }

    loader.hidden = true;
}

function fill(input, val) {
    $(`#${input}`).val(val);
    $(`#${input}-sug`).hide();
}