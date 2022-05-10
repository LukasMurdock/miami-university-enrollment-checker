// deno run --allow-net enrollmentCheck.ts -t 'Fall 2022-23' 'CSE 252' 'CSE 271'
import { parse } from 'https://deno.land/std@0.138.0/flags/mod.ts';

// ******************************** In-file Configuration
let coursesToCheck: string[] = []; // ['CSE 252', 'CSE 271']
let term = ''; // 'Fall 2022-23'
// ******************************** In-file Configuration

// Script Arguments
// -t 'Fall 2022-23' 'CSE 252' 'CSE 271'
const args = parse(Deno.args);

// Use in-file configuration, if set
if (term.length === 0) {
    if (args.t) {
        term = args.t;
    } else {
        console.log(
            "To configure a term, write `-t 'Fall 2022-23'` to the end of your command"
        );
        throw new Error('No term configured');
    }
}
term = term.length > 0 ? term : args.t;
coursesToCheck =
    coursesToCheck.length > 0 ? coursesToCheck : (args._ as string[]);

if (coursesToCheck.length < 1) {
    console.log(args._);
    console.log(coursesToCheck);
    console.log(parseCourseParameters(args._));
    console.log(
        'To configure courses, write `CSE 252` to the end of your command'
    );
    throw new Error('No courses configured');
}

function parseTermParameter(param: string) {
    return param.split('_').join(' ');
}

function parseCourseParameters(params: (string | number)[]) {
    return params.reduce((acc: string[], curr, index, array) => {
        if (index % 2) {
            acc.push(array[index - 1] + ' ' + curr);
        }
        return acc;
    }, []);
}

// Script starts here
const seasonCodes = [
    { name: 'fall', code: 10 },
    { name: 'winter', code: 15 },
    { name: 'spring', code: 20 },
    { name: 'summer', code: 30 },
];

function termStringToId(termString: string) {
    // e.g., 'Fall 2022-23'
    const [seasonString, yearString] = termString.split(' ');
    const season = seasonCodes.find((seasonCode) =>
        seasonString.toLowerCase().includes(seasonCode.name)
    );
    // 2022-23 -> '20' + '23'
    const year = '20' + yearString.split('-')[1];
    if (season) {
        const termId = year + season.code;
        return termId;
    } else {
        console.log('Invalid season string');
        return undefined;
    }
}

async function getNextTermFromApi(): Promise<ApiTerm> {
    console.info('API:\tfetching next term');
    const endpoint =
        'http://ws.miamioh.edu/api/academic/banner/v2/academicTerms/next';
    const response = await fetch(endpoint);
    const { data }: { data: ApiTerm } = await response.json();
    return data;
}

export async function getCourseSections({
    termId,
    campusCode,
    subjectCode,
    courseNumber,
    sectionCode,
}: {
    campusCode: string;
    subjectCode: string;
    termId?: string;
    courseNumber?: string;
    sectionCode?: string;
}) {
    const term = termId ?? (await getNextTermFromApi()).termId;
    const campus = `campusCode=${campusCode}`;
    const subject = `courseSubjectCode=${subjectCode}`;
    const section = sectionCode ? `courseSectionCode=${sectionCode}` : '';
    const number = courseNumber ? `courseNumber=${courseNumber}` : '';
    const parameters = [campus, subject, section, number].join('&');

    const endpoint = `http://ws.miamioh.edu/courseSectionV2/${term}.json?${parameters}`;
    console.log(endpoint);

    const response = await fetch(endpoint);

    const { courseSections }: { courseSections: ApiCourseSection[] } =
        await response.json();

    return courseSections;
}

function filterForOpenSeats() {}

async function simpleCourseChecker() {
    const termId = termStringToId(term);

    function parseCourseString(course: string) {
        const [subjectCode, courseNumber, sectionCode] = course.split(' ');
        return { subjectCode, courseNumber, sectionCode };
    }

    const courseData = await Promise.all(
        coursesToCheck.map(parseCourseString).map(
            async (course) =>
                await getCourseSections({
                    campusCode: 'O',
                    termId: termId,
                    courseNumber: course.courseNumber,
                    subjectCode: course.subjectCode,
                    sectionCode: course.sectionCode,
                })
        )
    );

    for (const courseSections of courseData) {
        for (const course of courseSections) {
            // Bulk check
            // if (
            //     Number(course.enrollmentCountCurrent) !== 0 &&
            //     course.enrollmentCountCurrent < course.enrollmentCountMax
            // ) {
            console.log(
                course.courseId +
                    ' ' +
                    course.courseCode +
                    ': ' +
                    course.enrollmentCountCurrent +
                    '/' +
                    course.enrollmentCountMax +
                    ' ' +
                    course.courseTitle
            );
            // }
        }
    }
}

simpleCourseChecker();

// TYPES
export type ApiTerm = {
    termId: string;
    name: string;
    startDate: string;
    endDate: string;
    academicTermResource: string;
    displayTerm: boolean;
};

export type ApiCourseSection = {
    academicTerm: string; // 202220
    academicTermDesc: string; // Spring Semester 2021-22
    courseId: string; // 22472 -> Course registration number (CRN)
    recordNumber: string; // 1
    courseCode: string; // PSY 111 A
    schoolCode: string; // AS
    schoolName: string; // College of Arts and Science
    deptName: string; // Psychology
    deptCode: string; // PSY
    standardizedDivisionCode: string; // CAS
    standardizedDivisionName: string; // College of Arts & Science"
    standardizedDeptCode: string; // PSY
    standardizedDeptName: string; // Psychology
    traditionalStandardizedDeptCode: string; // PSY
    traditionalStandardizedDeptName: string; // Psychology
    courseTitle: string; // Introduction to Psychology
    instructionalType: string; // L
    instructionalTypeDescription: string; // Lecture
    courseSubjectCode: string; // PSY
    courseSubjectDesc: string; // Psychology
    courseNumber: string; // 111
    courseSectionCode: string; // A
    courseStatus: string; // Inactive
    campusCode: string; // O
    campusName: string; // Oxford
    creditHoursDesc: string;
    creditHoursHigh: string;
    creditHoursLow: string;
    lectureHoursDesc: string;
    lectureHoursLow: string;
    lectureHoursHigh: string;
    labHoursDesc: string;
    labHoursLow: string;
    labHoursHigh: string;
    enrollmentCountMax: string;
    enrollmentCountCurrent: string;
    enrollmentCountActive: string;
    enrollmentCountAvailable: string;
    partOfTermCode: string; // 1
    partOfTermName: string; // Full Semester
    partOfTermStartDate: string;
    partOfTermEndDate: string;
    midtermGradeSubmissionAvailable: string;
    finalGradeSubmissionAvailable: string;
    gradeRequiredFinal: string;
    courseDescription: string;
    prntInd: string;
    courseSchedules: ApiCourseSchedule[];
    instructors: ApiInstructor[];
    attributes: ApiCourseAttribute[];
    crossListedCourses: any[];
    courseSectionResource: string;
    enrollmentResource: string;
    academicTermResource: string;
};

export interface ApiCourseSchedule {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    room: string;
    buildingCode: string;
    buildingName: string;
    days: string;
    scheduleTypeCode: string;
    scheduleTypeDescription: string;
}

export interface ApiInstructor {
    username: string;
    nameLast: string;
    nameFirst: string;
    nameMiddle: string;
    namePrefix: string;
    nameSuffix?: any;
    nameFirstPreferred?: any;
    nameDisplayInformal: string;
    nameDisplayFormal: string;
    nameSortedInformal: string;
    nameSortedFormal: string;
    personResource: string;
    primaryInstructor: string;
}

export interface ApiCourseAttribute {
    attributeCode: string;
    attributeDescription: string;
}
