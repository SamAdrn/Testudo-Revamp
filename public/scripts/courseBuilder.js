let allCourses; // global variable to keep track of courses on page

// prettier-ignore
let statistics = {
    cred1: false, cred2: false, cred3: false, 
    cred4: false, cred5: false, cred6: false,
    fsaw: false, fsar: false, fsma: false, fsoc: false, fspw: false,
    dshs: false, dshu: false, dsns: false, dsnl: false, dssp: false,
    dvcc: false, dvup: false, scis: false
}

$(document).ready(function () {
    allCourses = Array.from($("#courses-div").children());

    const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
        (triggerElt) => new bootstrap.Tooltip(triggerElt)
    );

    $('[name^="sort"],[name^="filter"],#showonly-filter-gened').click(() => {
        console.log('hello');
        if ($('[name="filter-credits-cb"]').is(":checked")) {
            $('#deselect-filter-credits').prop('checked', false);
        }
        if ($('[name="filter-gened-cb"]').is(":checked")) {
            $('#deselect-filter-gened').prop('checked', false);
        }
        sortFilterCourses();
    });

    $('#deselect-filter-credits').click(() => {
        if ($('#deselect-filter-credits').is(":checked")) {
            $('[name="filter-credits-cb"]').prop('checked', false);
        } else {
            $('[name="filter-credits-cb"]').prop('checked', true);
        }
        sortFilterCourses();
    });

    $('#deselect-filter-gened').click(() => {
        if ($('#deselect-filter-gened').is(":checked")) {
            $('[name="filter-gened-cb"]').prop('checked', false);
        } else {
            $('[name="filter-gened-cb"]').prop('checked', true);
        }
        sortFilterCourses();
    });
});

function sortFilterCourses() {
    let courses = allCourses.filter(filterAux);
    if ($("#sort-credits").is(":checked")) {
        $("#courses-div").empty().append(courses.sort(creditsComparator));
    } else {
        $("#courses-div").empty().append(courses.sort(idComparator));
    }
}

function idComparator(a, b) {
    if (a.dataset.courseId < b.dataset.courseId) {
        return -1;
    }
    if (a.dataset.courseId > b.dataset.courseId) {
        return 1;
    }
    return 0;
}

function creditsComparator(a, b) {
    if (a.dataset.credits < b.dataset.credits) {
        return -1;
    }
    if (a.dataset.credits > b.dataset.credits) {
        return 1;
    }
    return idComparator(a, b);
}

// prettier-ignore
function filterAux(c) {
    return ((
            ($("#filter-credits-1").is(":checked") && +c.dataset.credits === 1) ||
            ($("#filter-credits-2").is(":checked") && +c.dataset.credits === 2) ||
            ($("#filter-credits-3").is(":checked") && +c.dataset.credits === 3) ||
            ($("#filter-credits-4").is(":checked") && +c.dataset.credits === 4) ||
            ($("#filter-credits-5").is(":checked") && +c.dataset.credits === 5) ||
            ($("#filter-credits-6").is(":checked") && +c.dataset.credits === 6)
        ) && (
            (!$("#showonly-filter-gened").is(":checked") && c.dataset.gened == '') ||
            ($("#filter-fsaw").is(":checked") && c.dataset.gened.includes("FSAW")) ||
            ($("#filter-fsar").is(":checked") && c.dataset.gened.includes("FSAR")) ||
            ($("#filter-fsma").is(":checked") && c.dataset.gened.includes("FSMA")) ||
            ($("#filter-fsoc").is(":checked") && c.dataset.gened.includes("FSOC")) ||
            ($("#filter-fspw").is(":checked") && c.dataset.gened.includes("FSPW")) ||
            ($("#filter-dshs").is(":checked") && c.dataset.gened.includes("DSHS")) ||
            ($("#filter-dshu").is(":checked") && c.dataset.gened.includes("DSHU")) ||
            ($("#filter-dsns").is(":checked") && c.dataset.gened.includes("DSNS")) ||
            ($("#filter-dsnl").is(":checked") && c.dataset.gened.includes("DSNL")) ||
            ($("#filter-dssp").is(":checked") && c.dataset.gened.includes("DSSP")) ||
            ($("#filter-dvcc").is(":checked") && c.dataset.gened.includes("DVCC")) ||
            ($("#filter-dvup").is(":checked") && c.dataset.gened.includes("DVUP")) ||
            ($("#filter-scis").is(":checked") && c.dataset.gened.includes("SCIS"))
        )
    );
}

async function getSections(accordBtn, idNum, courseID) {
    const sectionsDiv = document.getElementById(`course-sect-${idNum}`);
    const loader = document.getElementById(`loader-${idNum}`);

    loader.classList.remove("hidden");

    if (sectionsDiv.innerHTML !== "") {
        const url =
            "/sections?" + new URLSearchParams({ course: courseID }).toString();
        let result = [],
            error = "";

        await fetch(url)
            .then((response) => response.json())
            .then((json) => (result = json))
            .catch((e) => (error = e));

        if (error !== "") {
            let div = [
                '<div class="p-5 text-center">',
                "   There was an issue retrieving sections, please try again later.",
                "</div>",
            ].join("");
            sectionsDiv.innerHTML = div;
        } else if (result.sections.length !== 0) {
            sectionsDiv.innerHTML = buildSectionsDiv(
                result.sections,
                result.favorites
            );
            accordBtn.removeAttribute("onclick");
        } else {
            let div = [
                '<div class="p-5 text-center">',
                "   No sections to display. Contact department to register for this course.",
                "</div>",
            ].join("");
            sectionsDiv.innerHTML = div;
            accordBtn.removeAttribute("onclick");
        }
    }
    loader.classList.add("hidden");
}

function buildSectionsDiv(sectionsArr, favoritesArr) {
    let res = '<div class="accordion-body">',
        i = 0;
    for (let section of sectionsArr) {
        // Section Div Body
        res += '<div class="row g-0 p-3 ';
        if (section.open_seats < 1) {
            res += 'section-full"';
        } else {
            res += 'section-open"';
        }
        // Alternate between Background Colors
        if (++i % 2 !== 0) {
            res += 'style="background-color: #F8F9FA;"';
        }
        res += ">";

        // Section Number
        res += `<div class="col-1 align-self-center"><h6>${section.number}</h6></div>`;

        // Instructor Information
        res += `<div class="col-3 ps-3 align-self-center"><h4>${section.instructors.join(
            ",<br>"
        )}</h4></div>`;

        // Meetings
        res += '<div class="col-5 align-self-center">';
        section.meetings.forEach((meeting) => {
            // Meeting Information
            res += '<div class="row">';
            res += `<strong class="col-5">${
                meeting.classtype === "" ? "Lecture:" : "Discussion:"
            }</strong>`;
            res += `<p class="m-0 col-7">${meeting.building} ${meeting.room} `;
            if (meeting.days !== "") {
                res += `(${meeting.days} : ${meeting.start_time} - ${meeting.end_time})`;
            }
            res += "</p></div>";
        });
        res += "</div>";

        // Seating Information
        res +=
            '<div class="col-2 ps-3 align-self-center"><h6>Seats Available:</h6>';
        res += `<h4> ${section.open_seats} / ${section.seats} </h4>`;
        if (section.open_seats < 1) {
            res += `<h6>(${section.waitlist} in Waitlist)</h6>`;
        }
        res += "</div>";

        // Favorite Button
        res +=
            '<div class="col-1 align-self-center ps-3"><button class="fav-button">';
        res += '<i class="fa-solid fa-star fav-star ps-3';
        if (favoritesArr.some((s) => s.section === section.number)) {
            res += "fav-checked";
        }
        res += `" onclick="handleFav(this, '${section.section_id}')"></i>`;
        res += "</button></div></div>";
    }
    res += "</div>";
    return res;
}
