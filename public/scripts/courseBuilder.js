let allCourses; // global variable to keep track of courses on page
let sections = new Map(); // global variable to keep track of courses on page

// prettier-ignore
let courseStats = {
    cred1: false, cred2: false, cred3: false, 
    cred4: false, cred5: false, cred6: false,
    fsaw: false, fsar: false, fsma: false, fsoc: false, fspw: false,
    dshs: false, dshu: false, dsns: false, dsnl: false, dssp: false,
    dvcc: false, dvup: false, scis: false
}

// prettier-ignore
let sectFilterCache = {
    open: false, m: true, tu: true, w: true, th: true, f: true,
    startTime: "5:00am", endTime: "11:30pm", f2f: true, ble: true, onl: true
}

// Class Declarations
class Time {
    startHr;
    startMin;
    endHr;
    endMin;
    online = false;

    constructor(start, end) {
        if (start == "" && end == "") {
            this.online = true;
        } else {
            let { hr, min } = this.convertTo24hr(start);
            this.startHr = hr;
            this.startMin = min;

            ({ hr, min } = this.convertTo24hr(end));
            this.endHr = hr;
            this.endMin = min;
        }
    }

    convertTo24hr(time) {
        const md = time.slice(-2).toLowerCase();
        let h = +time.split(":")[0];
        let m = +time.split(":")[1].slice(0, 2);

        if (md == "am" && h == 12) {
            h -= 12;
        } else if (md == "pm" && h != 12) {
            h += 12;
        }

        return { hr: h, min: m };
    }

    inBetween(startRg, endRg) {
        if (this.online) {
            return true;
        }

        console.log(`${this.startHr}:${this.startMin} - ${this.endHr}:${this.endMin}`);

        startRg = this.convertTo24hr(startRg);
        endRg = this.convertTo24hr(endRg);

        console.log(`in between`);
        console.log(`${startRg.hr}:${startRg.min} - ${endRg.hr}:${endRg.min}`);

        let ret = true;

        ret &&= (this.startHr > startRg.hr) || (this.startHr == startRg.hr && this.startMin >= startRg.min);
        ret &&= (this.endHr < endRg.hr) || (this.endHr == endRg.hr && this.endMin <= endRg.min);

        return ret;
    }
}

// Initializations to do after the document is loaded
$(document).ready(function () {
    allCourses = Array.from($("#courses-div").children());

    const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
        (triggerElt) => new bootstrap.Tooltip(triggerElt)
    );

    initCourseStats();
    initCourseFilters();

    $('[name^="sort"],[name^="filter"],#showonly-filter-gened').click(() => {
        if ($('[name="filter-credits-cb"]').is(":checked")) {
            $("#deselect-filter-credits").prop("checked", false);
        }
        if ($('[name="filter-gened-cb"]').is(":checked")) {
            $("#deselect-filter-gened").prop("checked", false);
        }
        sortFilterCourses();
    });

    $("#deselect-filter-credits").click(() => {
        if ($("#deselect-filter-credits").is(":checked")) {
            $('[name="filter-credits-cb"]').prop("checked", false);
        } else {
            $('[name="filter-credits-cb"]:not(:disabled)').prop(
                "checked",
                true
            );
        }
        sortFilterCourses();
    });

    $("#deselect-filter-gened").click(() => {
        if ($("#deselect-filter-gened").is(":checked")) {
            $('[name="filter-gened-cb"]').prop("checked", false);
        } else {
            $('[name="filter-gened-cb"]:not(:disabled)').prop("checked", true);
        }
        sortFilterCourses();
    });

    $('[name^="section-filter"]').change((e) => {
        const id = e.currentTarget.dataset.target;
        if ($(`#course-sect-${id}`).data("sectionsAvai") === "true") {
            console.log("section filter fired");
            sortFilterSections(id);
        }
    });

    $('[name="section-filter-time-end-sel"]').each(() => {
        $("[name='section-filter-time-end-sel'] option[value='11:30pm']").attr(
            "selected",
            "selected"
        );
    });

    $("[id^=reset-filter-sections-]").click((e) => {
        const id = e.currentTarget.dataset.target;

        $(`#section-filter-open-${id}:not(:disabled)`).prop("checked", false);

        $(`#section-filter-m-${id}:not(:disabled)`).prop("checked", true);
        $(`#section-filter-tu-${id}:not(:disabled)`).prop("checked", true);
        $(`#section-filter-w-${id}:not(:disabled)`).prop("checked", true);
        $(`#section-filter-th-${id}:not(:disabled)`).prop("checked", true);
        $(`#section-filter-f-${id}:not(:disabled)`).prop("checked", true);

        $(`#section-filter-time-start-${id} option[value="5:00am"]`)
            .attr("selected", "selected")
            .prop("selected", "selected");
        $(`#section-filter-time-end-${id} option[value="11:30pm"]`)
            .attr("selected", "selected")
            .prop("selected", "selected");

        $(`#section-filter-f2f-${id}:not(:disabled)`).prop("checked", true);
        $(`#section-filter-ble-${id}:not(:disabled)`).prop("checked", true);
        $(`#section-filter-onl-${id}:not(:disabled)`).prop("checked", true);

        $(`#trigger-section-${id}`).trigger("change");
    });

    $("#reset-filter-sections-global").click(() => {
        $("[id$=global]").prop("checked", true);
        $("#section-filter-open-global").prop("checked", false);
        $('#section-filter-time-start-global option[value="5:00am"]').attr(
            "selected",
            "selected"
        );
        $('#section-filter-time-end-global option[value="11:30pm"]').attr(
            "selected",
            "selected"
        );
    });

    $("#btn-apply-global-sect-filters").click(() => {
        sectFilterCache.open = $("#section-filter-open-global").is(":checked");

        sectFilterCache.m = $("#section-filter-m-global").is(":checked");
        sectFilterCache.tu = $("#section-filter-tu-global").is(":checked");
        sectFilterCache.w = $("#section-filter-w-global").is(":checked");
        sectFilterCache.th = $("#section-filter-th-global").is(":checked");
        sectFilterCache.f = $("#section-filter-f-global").is(":checked");

        sectFilterCache.startTime = $(
            "#section-filter-time-start-global"
        ).val();
        sectFilterCache.endTime = $("#section-filter-time-end-global").val();

        sectFilterCache.f2f = $("#section-filter-f2f-global").is(":checked");
        sectFilterCache.ble = $("#section-filter-blend-global").is(":checked");
        sectFilterCache.onl = $("#section-filter-onl-global").is(":checked");

        applyGlobalFilters();
    });
});

// Event Listeners to fire for any changes throughout the document
$(document).change(function () {
    if (
        $('[name="filter-credits-cb"]').length ===
        $('[name="filter-credits-cb"]:not(:checked)').length
    ) {
        $("#deselect-filter-credits").prop("checked", true);
    }

    if (
        $('[name="filter-gened-cb"]').length ===
        $('[name="filter-gened-cb"]:not(:checked)').length
    ) {
        $("#deselect-filter-gened").prop("checked", true);
    }
});

const initCourseStats = () =>
    allCourses.forEach((c) => {
        const creds = $(c).data("credits");
        const gened = $(c).data("gened");

        courseStats.cred1 ||= creds == "1";
        courseStats.cred2 ||= creds == "2";
        courseStats.cred3 ||= creds == "3";
        courseStats.cred4 ||= creds == "4";
        courseStats.cred5 ||= creds == "5";
        courseStats.cred6 ||= creds == "6";

        courseStats.fsaw ||= gened.includes("FSAW");
        courseStats.fsar ||= gened.includes("FSAR");
        courseStats.fsma ||= gened.includes("FSMA");
        courseStats.fsoc ||= gened.includes("FSOC");
        courseStats.fspw ||= gened.includes("FSPW");

        courseStats.dshs ||= gened.includes("DSHS");
        courseStats.dshu ||= gened.includes("DSHU");
        courseStats.dsns ||= gened.includes("DSNS");
        courseStats.dsnl ||= gened.includes("DSNL");
        courseStats.dssp ||= gened.includes("DSSP");

        courseStats.dvcc ||= gened.includes("DVVC");
        courseStats.dvup ||= gened.includes("DVUP");

        courseStats.scis ||= gened.includes("SCIS");
    });

function initCourseFilters() {
    $("#filter-credits-1")
        .prop("checked", courseStats.cred1)
        .prop("disabled", !courseStats.cred1);
    $("#filter-credits-2")
        .prop("checked", courseStats.cred2)
        .prop("disabled", !courseStats.cred2);
    $("#filter-credits-3")
        .prop("checked", courseStats.cred3)
        .prop("disabled", !courseStats.cred3);
    $("#filter-credits-4")
        .prop("checked", courseStats.cred4)
        .prop("disabled", !courseStats.cred4);
    $("#filter-credits-5")
        .prop("checked", courseStats.cred5)
        .prop("disabled", !courseStats.cred5);
    $("#filter-credits-6")
        .prop("checked", courseStats.cred6)
        .prop("disabled", !courseStats.cred6);

    $("#filter-gened-fsaw")
        .prop("checked", courseStats.fsaw)
        .prop("disabled", !courseStats.fsaw);
    $("#filter-gened-fsar")
        .prop("checked", courseStats.fsar)
        .prop("disabled", !courseStats.fsar);
    $("#filter-gened-fsma")
        .prop("checked", courseStats.fsma)
        .prop("disabled", !courseStats.fsma);
    $("#filter-gened-fsoc")
        .prop("checked", courseStats.fsoc)
        .prop("disabled", !courseStats.fsoc);
    $("#filter-gened-fspw")
        .prop("checked", courseStats.fspw)
        .prop("disabled", !courseStats.fspw);

    $("#filter-gened-dshs")
        .prop("checked", courseStats.dshs)
        .prop("disabled", !courseStats.dshs);
    $("#filter-gened-dshu")
        .prop("checked", courseStats.dshu)
        .prop("disabled", !courseStats.dshu);
    $("#filter-gened-dsns")
        .prop("checked", courseStats.dsns)
        .prop("disabled", !courseStats.dsns);
    $("#filter-gened-dsnl")
        .prop("checked", courseStats.dsnl)
        .prop("disabled", !courseStats.dsnl);
    $("#filter-gened-dssp")
        .prop("checked", courseStats.dssp)
        .prop("disabled", !courseStats.dssp);

    $("#filter-gened-dvcc")
        .prop("checked", courseStats.dvcc)
        .prop("disabled", !courseStats.dvcc);
    $("#filter-gened-dvup")
        .prop("checked", courseStats.dvup)
        .prop("disabled", !courseStats.dvup);

    $("#filter-gened-scis")
        .prop("checked", courseStats.scis)
        .prop("disabled", !courseStats.scis);

    if (
        $('[name="filter-credits-cb"]').length ===
        $('[name="filter-credits-cb"]:disabled').length
    ) {
        $("#deselect-credits-gened")
            .prop("checked", true)
            .prop("disabled", true);
    }

    if (
        $('[name="filter-gened-cb"]').length ===
        $('[name="filter-gened-cb"]:disabled').length
    ) {
        $("#deselect-filter-gened")
            .prop("checked", true)
            .prop("disabled", true);
        $("#showonly-filter-gened").prop("disabled", true);
    }
}

function sortFilterCourses() {
    let courses = allCourses.filter(filterCoursesAux);
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
function filterCoursesAux(c) {
    const creds = +c.dataset.credits;
    const gened = c.dataset.gened;

    return ((
            ($("#filter-credits-1").is(":checked") && creds === 1) ||
            ($("#filter-credits-2").is(":checked") && creds === 2) ||
            ($("#filter-credits-3").is(":checked") && creds === 3) ||
            ($("#filter-credits-4").is(":checked") && creds === 4) ||
            ($("#filter-credits-5").is(":checked") && creds === 5) ||
            ($("#filter-credits-6").is(":checked") && creds === 6)
        ) && (
            (!$("#showonly-filter-gened").is(":checked") && gened == '') ||

            ($("#filter-gened-fsaw").is(":checked") && gened.includes("FSAW")) ||
            ($("#filter-gened-fsar").is(":checked") && gened.includes("FSAR")) ||
            ($("#filter-gened-fsma").is(":checked") && gened.includes("FSMA")) ||
            ($("#filter-gened-fsoc").is(":checked") && gened.includes("FSOC")) ||
            ($("#filter-gened-fspw").is(":checked") && gened.includes("FSPW")) ||

            ($("#filter-gened-dshs").is(":checked") && gened.includes("DSHS")) ||
            ($("#filter-gened-dshu").is(":checked") && gened.includes("DSHU")) ||
            ($("#filter-gened-dsns").is(":checked") && gened.includes("DSNS")) ||
            ($("#filter-gened-dsnl").is(":checked") && gened.includes("DSNL")) ||
            ($("#filter-gened-dssp").is(":checked") && gened.includes("DSSP")) ||

            ($("#filter-gened-dvcc").is(":checked") && gened.includes("DVCC")) ||
            ($("#filter-gened-dvup").is(":checked") && gened.includes("DVUP")) ||

            ($("#filter-gened-scis").is(":checked") && gened.includes("SCIS"))
        )
    );
}

async function getSections(accordBtn, idNum, courseID) {
    const sectionsDiv = $(`#course-sect-${idNum}`);
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
            const div = [
                '<div class="p-5 text-center">',
                "   There was an issue retrieving sections, please try again later.",
                "</div>",
            ].join("");
            sectionsDiv.append(div);
        } else if (result.sections.length !== 0) {
            let sects = buildSectionsDiv(
                result.sections,
                result.favorites,
                idNum
            );
            $(`#section-placeholder-${idNum}`).hide();
            sectionsDiv.append(sects[0]);
            initSections(idNum, sects[1]);
            sectionsDiv.data("sectionsAvai", "true");
            accordBtn.removeAttribute("onclick");
            $("[name=section-filter-hidden]").trigger("change");
        } else {
            const div = [
                '<div class="p-5 text-center">',
                "   No sections to display. Contact department to register for this course.",
                "</div>",
            ].join("");
            $(`#section-placeholder-${idNum}`).hide();
            sectionsDiv.append(div);
            accordBtn.removeAttribute("onclick");
        }
    }
    loader.classList.add("hidden");
}

// prettier-ignore
function buildSectionsDiv(sections, favs, id) {
    let i = 0, res = '';
    let stats = {
        allOpen: true, allClosed: true,
        online: false, blended: false, inperson: false,
        days: {
            m: false, tu: false, w: false, th: false, f: false
        }
    };

    sections.forEach((sec) => {
        if (sec.instructors.length !== 0) {

            // Get section metrics
            let online = false, inperson = false, days = '', stTimes = [], endTimes = [];
            sec.meetings.forEach((m) => {
                online ||= m.room.includes('ONLINE');
                inperson ||= !m.room.includes('ONLINE');
                days += m.days;
                stTimes.push(m.start_time);
                endTimes.push(m.end_time);
            });
            const delivery = (online && inperson) ? "Blended" : (online) ? "Online" : "Face-to-Face";

            // Aggregate them to metrics for all sections
            stats.allOpen &&= sec.open_seats > 0;
            stats.allClosed &&= sec.open_seats == 0;
            stats.online ||= online && !inperson;
            stats.blended ||= online && inperson;
            stats.inperson ||= !online && inperson;
            stats.days.m ||= days.includes('M');
            stats.days.tu ||= days.includes('Tu');
            stats.days.w ||= days.includes('W');
            stats.days.th ||= days.includes('Th');
            stats.days.f ||= days.includes('F');

            // Build DOM element for section
            res += [
                // Section Div Body
                `<div class="row g-0 p-3 ${sec.open_seats < 1 ? 'section-full' : 'section-open'}"`,
                // Alternate between Background Colors
                `       ${++i % 2 !== 0 ? 'style="background-color: #F8F9FA;"' : ''}`,
                `       data-seats="${sec.open_seats}" data-delivery="${delivery}" data-days="${days}"`,
                `       data-start-times="${stTimes.join(",")}" data-end-times="${endTimes.join(",")}">`,
    
                // Section Number
                '   <div class="col-1 align-self-center">',
                `       <h6>${sec.number}</h6>`,
                '   </div>',
    
                // Instructor Information
                '   <div class="col-3 align-self-center">',
                `       <h4>${sec.instructors.join(",<br>")}</h4>`,
                '   </div>',
    
                // Meetings Div
                '   <div class="col-5 align-self-center">'
            ].join('');
    
            // Meeting Information
            sec.meetings.forEach((mt) => {
                res += [
                    '   <div class="row">',
                    `       <strong class="col-xxl-3">${mt.classtype === "" ? "Lecture:" : "Discussion:"}</strong>`,
                    '       <p class="m-0 col-xxl-8">',
                    `           ${mt.building} ${mt.room} ${mt.days !== "" ? `<wbr>(${mt.days} : ${mt.start_time} - ${mt.end_time})` : ''}`,
                    '       </p>',
                    '   </div>'
                ].join('');
            });
    
            res += [
                '   </div>',
    
                // Seating Information
                '   <div class="col-2 ps-3 align-self-center">',
                '       <h6>Seats Available:</h6>',
                `       <h4> ${sec.open_seats} / ${sec.seats} </h4>`,
                `       ${sec.open_seats < 1 ? `<h6>(${sec.waitlist} in Waitlist)</h6>` : ''}`,
                '   </div>',
    
                // Favorite Button
                '   <div class="col-1 align-self-center ps-3">',
                '       <button class="fav-button">',
                '           <i class="fa-solid fa-star fav-star ps-3 ',
                `                   ${favs.some((s) => s.section === sec.number) ? 'fav-checked ': ''}"`,
                `                   onclick="handleFav(this, '${sec.section_id}')">`,
                '           </i>',
                '       </button>',
                '   </div>',
    
                '</div>'
            ].join('');
        }
    })
    return [`<div class="accordion-body" id="sections-${id}" hidden> ${res} </div>`, stats];
}

function initSections(id, stats) {
    const sects = Array.from($(`#sections-${id}`).children());
    sections.set(id, sects);

    $(`#section-filter-open-${id}`)
        .prop(
            "checked",
            stats.allOpen || (!stats.allClosed && sectFilterCache.open)
        )
        .prop("disabled", stats.allClosed || stats.allOpen);

    $(`#section-filter-m-${id}`)
        .prop("checked", stats.days.m && sectFilterCache.m)
        .prop("disabled", !stats.days.m);
    $(`#section-filter-tu-${id}`)
        .prop("checked", stats.days.tu && sectFilterCache.tu)
        .prop("disabled", !stats.days.tu);
    $(`#section-filter-w-${id}`)
        .prop("checked", stats.days.w && sectFilterCache.w)
        .prop("disabled", !stats.days.w);
    $(`#section-filter-th-${id}`)
        .prop("checked", stats.days.th && sectFilterCache.th)
        .prop("disabled", !stats.days.th);
    $(`#section-filter-f-${id}`)
        .prop("checked", stats.days.f && sectFilterCache.f)
        .prop("disabled", !stats.days.f);

    $(
        `#section-filter-time-start-${id} option[value='${sectFilterCache.startTime}']`
    ).attr("selected", "selected");
    $(
        `#section-filter-time-end-${id} option[value='${sectFilterCache.endTime}']`
    ).attr("selected", "selected");

    $(`#section-filter-f2f-${id}`)
        .prop("checked", stats.inperson && sectFilterCache.f2f)
        .prop("disabled", !stats.inperson);
    $(`#section-filter-ble-${id}`)
        .prop("checked", stats.blended && sectFilterCache.ble)
        .prop("disabled", !stats.blended);
    $(`#section-filter-onl-${id}`)
        .prop("checked", stats.online && sectFilterCache.onl)
        .prop("disabled", !stats.online);

    $(`#section-filter-toolbar-${id}`).prop("hidden", false);
    $(`#sections-${id}`).prop("hidden", false);
}

function sortFilterSections(id) {
    console.log(id);
    let alert = [
        '<div class="alert alert-warning text-center mt-2" role="alert">',
        `   <div>Sorry, no courses to display based on current filter. Try resetting them to show more results.</div>`,
        "</div>",
    ].join("");
    let sect = sections.get(id);
    let filtered = sect.filter(filterSectionsAux(id));
    $(`#sections-${id}`)
        .empty()
        .append(filtered.length === 0 ? alert : filtered);
}

// prettier-ignore
function filterSectionsAux(id) {
    return function(s) {

        // Initialize Section times to Time Objects
        const startRg = $(`#section-filter-time-start-${id}`).val();
        const endRg = $(`#section-filter-time-end-${id}`).val();
        const sectStTimes = s.dataset.startTimes.split(',');
        const sectEdTimes = s.dataset.endTimes.split(',');
        const sectTimes = [];
        for (let i = 0; i < sectStTimes.length; i++) {
            sectTimes.push(new Time(sectStTimes[i], sectEdTimes[i]));
        }

        // Retrieve relevant data
        const days = s.dataset.days;

        return (
            sectTimes.some((t) => t.inBetween(startRg, endRg))
        ) && (
            ($(`#section-filter-open-${id}`).is(":checked") && +s.dataset.seats > 0) ||
            (!$(`#section-filter-open-${id}`).is(":checked"))
        ) && (
            ($(`#section-filter-m-${id}`).is(":checked") && days.includes("M")) ||
            ($(`#section-filter-tu-${id}`).is(":checked") && days.includes("Tu")) ||
            ($(`#section-filter-w-${id}`).is(":checked") && days.includes("W")) ||
            ($(`#section-filter-th-${id}`).is(":checked") && days.includes("Th")) ||
            ($(`#section-filter-f-${id}`).is(":checked") && days.includes("F"))
        ) && (
            ($(`#section-filter-f2f-${id}`).is(":checked") && s.dataset.delivery == 'Face-to-Face') ||
            ($(`#section-filter-ble-${id}`).is(":checked") && s.dataset.delivery == 'Blended') ||
            ($(`#section-filter-onl-${id}`).is(":checked") && s.dataset.delivery == 'Online')
        );
    }
}

function applyGlobalFilters() {
    sectFilterCache.open
        ? $("[name=section-filter-open-cb]:not(:disabled):not(:checked)").prop(
              "checked",
              true
          )
        : $("[name=section-filter-open-cb]:checked:not(:disabled)").prop(
              "checked",
              false
          );

    sectFilterCache.m
        ? $(
              "[name=section-filter-days-cb][id^=section-filter-m]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name=section-filter-days-cb][id^=section-filter-m]:checked:not(:disabled)"
          ).prop("checked", false);
    sectFilterCache.tu
        ? $(
              "[name=section-filter-days-cb][id^=section-filter-tu]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name=section-filter-days-cb][id^=section-filter-tu]:checked:not(:disabled)"
          ).prop("checked", false);
    sectFilterCache.w
        ? $(
              "[name=section-filter-days-cb][id^=section-filter-w]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name=section-filter-days-cb][id^=section-filter-w]:checked:not(:disabled)"
          ).prop("checked", false);
    sectFilterCache.th
        ? $(
              "[name=section-filter-days-cb][id^=section-filter-th]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name=section-filter-days-cb][id^=section-filter-th]:checked:not(:disabled)"
          ).prop("checked", false);
    sectFilterCache.f
        ? $(
              "[name=section-filter-days-cb][id^=section-filter-f]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name=section-filter-days-cb][id^=section-filter-f]:checked:not(:disabled)"
          ).prop("checked", false);

    $('[name="section-filter-time-start-sel"]').each(() => {
        $(
            `[name='section-filter-time-start-sel'] option[value='${sectFilterCache.startTime}']`
        ).attr("selected", "selected");
    });
    $('[name="section-filter-time-end-sel"]').each(() => {
        $(
            `[name='section-filter-time-end-sel'] option[value='${sectFilterCache.endTime}']`
        ).attr("selected", "selected");
    });

    sectFilterCache.f2f
        ? $(
              "[name='section-filter-deliver-cb'][id^=section-filter-f2f]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name='section-filter-deliver-cb'][id^=section-filter-f2f]:checked:not(:disabled)"
          ).prop("checked", false);
    sectFilterCache.ble
        ? $(
              "[name='section-filter-deliver-cb'][id^=section-filter-ble]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name='section-filter-deliver-cb'][id^=section-filter-ble]:checked:not(:disabled)"
          ).prop("checked", false);
    sectFilterCache.onl
        ? $(
              "[name='section-filter-deliver-cb'][id^=section-filter-onl]:not(:disabled):not(:checked)"
          ).prop("checked", true)
        : $(
              "[name='section-filter-deliver-cb'][id^=section-filter-onl]:checked:not(:disabled)"
          ).prop("checked", false);

    $("[name=section-filter-hidden]").trigger("change");
}
