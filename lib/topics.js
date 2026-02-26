/**
 * FILE CREATED AUTOMATICALLY, DO NOT EDIT!
 *
 * See the syncTopics.js script in the bot repository for details.
 */
export const topics = {
    academicEducation: {
        name: 'Academic Education',
        childOf: 'courses',
    },
    applicationForms: {
        name: 'Application forms',
        childOf: 'applyingForJobs',
    },
    applyingForJobs: {
        name: 'Applying for jobs',
        childOf: 'jobs',
    },
    apprenticeships: {
        name: 'Apprenticeships',
        childOf: null,
    },
    assessmentCentres: {
        name: 'Assessment Centres',
        childOf: 'applyingForJobs',
    },
    choosingACareer: {
        name: 'Choosing a career',
        childOf: 'decisionMaking',
    },
    communitySupport: {
        name: 'Community support',
        childOf: 'humanHelp',
    },
    courseNotAvailable: {
        name: 'Course not available?',
        childOf: 'decisionMaking',
    },
    courseSearch: {
        name: 'Search for courses',
        childOf: 'courses',
    },
    courses: {
        name: 'Courses & studying',
        childOf: null,
    },
    coverLetters: {
        name: 'Cover letters',
        childOf: 'applyingForJobs',
    },
    cvs: {
      name: 'CVs',
      childOf: 'applyingForJobs',
    },
    decisionMaking: {
        name: 'Decision making',
        childOf: null,
    },
    examResults: {
        name: 'Exam results',
        childOf: 'academicEducation',
    },
    freeAdvice: {
        name: 'Free careers support services',
        childOf: 'humanHelp',
    },
    freeChat: {
        name: 'Free chat',
        childOf: null,
    },
    handover: {
        name: 'Pass my details to an advisor',
        childOf: 'humanHelp',
    },
    higherEducation: {
        name: 'Higher Education',
        childOf: 'academicEducation',
    },
    humanHelp: {
        name: 'Speak to a person',
        childOf: null,
    },
    jobDiscovery: {
        name: 'Discover jobs',
        childOf: 'jobs',
    },
    jobInformation: {
        name: 'Job information',
        childOf: 'jobs',
    },
    jobSearch: {
        name: 'Search for job vacancies',
        childOf: 'jobs',
    },
    jobs: {
        name: 'Jobs',
        childOf: null,
    },
    jobsBySubject: {
        name: 'Explore jobs by subject',
        childOf: 'jobs',
    },
    other: {
        name: 'Other',
        childOf: undefined,
    },
    // Disabled as of Feb 2025 until CDI can provide a decent register
    // paidAdvice: {
    //     name: 'Paid-for careers support services',
    //,
    //,
    //,
    //     childOf: 'humanHelp',
    // },
    qualificationTypes: {
        name: 'Qualification types',
        childOf: 'courses',
    },
    returnToTopics: {
        name: 'End conversation and return to topics',
        childOf: undefined,
    },
    selfEmployment: {
        name: 'Self employment',
        childOf: null,
    },
    specialNeeds: {
        name: 'SEND opportunities',
        childOf: null,
    },
    tLevels: {
        name: 'T Levels',
        childOf: 'vocationalEducation',
        filter: ({userContext}) => !userContext.nation || ['England'].includes(userContext.nation),
    },
    ucasClearing: {
        name: 'UCAS Clearing',
        childOf: 'academicEducation',
    },
    vocationalEducation: {
        name: 'Vocational Education',
        childOf: 'courses',
    },
    volunteering: {
        name: 'Volunteering',
        childOf: null,
    }
}


